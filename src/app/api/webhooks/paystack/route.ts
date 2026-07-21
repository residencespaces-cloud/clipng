import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { creditTopUp } from "@/server/services/wallet.service";
import { handleTransferFailed, handleTransferSuccess } from "@/server/services/admin.service";

function verifyPaystackSignature(payload: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
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

  const isValid = verifyPaystackSignature(raw, signature);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

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

  try {
    if (event === "charge.success" && data) {
      const amountKobo = Number(data.amount ?? 0);
      const metadata = (data.metadata as Record<string, unknown>) ?? {};
      await creditTopUp(reference, amountKobo, metadata);
    } else if (event === "transfer.success" && data) {
      await handleTransferSuccess((data.reference as string) ?? reference);
    } else if (event === "transfer.failed" && data) {
      await handleTransferFailed(
        (data.reference as string) ?? reference,
        (data.reason as string) ?? undefined,
      );
    }
  } catch (e) {
    await prisma.paymentWebhook.update({
      where: { reference },
      data: { processed: false },
    });
    console.error("[paystack webhook]", e);
    return NextResponse.json({ message: "Processing failed" }, { status: 500 });
  }

  await prisma.paymentWebhook.update({
    where: { reference },
    data: { processed: true, processedAt: new Date() },
  });

  return NextResponse.json({ received: true });
}
