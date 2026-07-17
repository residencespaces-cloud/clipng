import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { rejectSubmission } from "@/server/services/admin.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    return ok(await rejectSubmission(auth.user.id, id, body.reason));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
