import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { createCampaign, listLive, listMy } from "@/server/services/campaigns.service";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  try {
    if (auth.user.role === "funder") return ok(await listMy(auth.user.id));
    return ok(await listLive());
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    return ok(await createCampaign(auth.user.id, body), 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
