import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { joinCampaign } from "@/server/services/campaigns.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireUser(request, ["clipper"]);
  if (auth.error) return auth.error;
  try {
    const { id } = await ctx.params;
    return ok(await joinCampaign(auth.user.id, id));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
