import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { extendCampaignBudget } from "@/server/services/campaigns.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    return ok(await extendCampaignBudget(auth.user.id, id, Number(body.amount)));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
