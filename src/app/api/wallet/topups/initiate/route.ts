import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { initiateTopUp } from "@/server/services/wallet.service";

export async function POST(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (!body.amount || body.amount < 100) return jsonError("Amount must be at least ₦100");
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const callbackUrl = origin ? `${origin}/funder?topup=success` : undefined;
    return ok(await initiateTopUp(auth.user.id, Number(body.amount), callbackUrl));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
