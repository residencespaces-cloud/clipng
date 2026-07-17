import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { creditTopUp } from "@/server/services/wallet.service";

function verifyPaystackSignature(payload: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret || !signature) return process.env.NODE_ENV !== "production";
  const hash = createHmac("sha512", secret).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as string;
  const data = body.data as Record<string, unknown> | undefined;
  const reference = (data?.reference as string) ?? `evt_${Date.now()}`;

  const existing = await prisma.paymentWebhook.findUnique({ where: { reference } });
  if (existing?.processed) return NextResponse.json({ received: true });

  await prisma.paymentWebhook.upsert({
    where: { reference },
    create: {
      eventType: event ?? "unknown",
      reference,
      payload: body as Prisma.InputJsonValue,
      processed: false,
    },
    update: {},
  });

  const isValid = verifyPaystackSignature(raw, signature);
  if (isValid && event === "charge.success" && data) {
    const amountKobo = Number(data.amount ?? 0);
    const metadata = (data.metadata as Record<string, unknown>) ?? {};
    await creditTopUp(reference, amountKobo, metadata);
  }

  await prisma.paymentWebhook.update({
    where: { reference },
    data: { processed: true, processedAt: new Date() },
  });

  return NextResponse.json({ received: true });
}
