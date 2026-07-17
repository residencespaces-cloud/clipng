import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { listMy } from "@/server/services/campaigns.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    return ok(await listMy(auth.user.id));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
