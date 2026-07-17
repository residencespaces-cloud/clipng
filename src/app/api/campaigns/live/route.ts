import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { listLive } from "@/server/services/campaigns.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["clipper"]);
  if (auth.error) return auth.error;
  try {
    return ok(await listLive());
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
