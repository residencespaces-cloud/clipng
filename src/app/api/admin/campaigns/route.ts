import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { listAllCampaigns } from "@/server/services/admin.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    return ok(await listAllCampaigns());
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
