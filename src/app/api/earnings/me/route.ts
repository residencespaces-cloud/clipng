import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { getEarningsSummary } from "@/server/services/submissions.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["clipper"]);
  if (auth.error) return auth.error;
  try {
    return ok(await getEarningsSummary(auth.user.id));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}
