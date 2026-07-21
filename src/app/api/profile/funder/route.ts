import { ok, updateFunderProfile } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (!body.businessName?.trim()) {
      return jsonError("Business name is required");
    }
    return ok(await updateFunderProfile(auth.user.id, body));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Update failed", 400);
  }
}
