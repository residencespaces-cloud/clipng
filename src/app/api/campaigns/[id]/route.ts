import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { getById, joinCampaign } from "@/server/services/campaigns.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await ctx.params;
    return ok(await getById(id));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Not found", 404);
  }
}

export async function POST() {
  return jsonError("Use /join for joining", 405);
}
