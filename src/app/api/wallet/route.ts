import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { getBalance } from "@/server/services/wallet.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    return ok(await getBalance(auth.user.id));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
