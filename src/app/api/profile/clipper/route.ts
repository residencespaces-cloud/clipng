import { ok, updateClipperProfile } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";

export async function PATCH(request: Request) {
  const auth = await requireUser(request, ["clipper"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    if (!body.bankName?.trim() || !body.accountNumber?.trim()) {
      return jsonError("Bank name and account number are required");
    }
    return ok(await updateClipperProfile(auth.user.id, body));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Update failed", 400);
  }
}
