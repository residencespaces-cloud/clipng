import { ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";
import { resetPasswordWithToken } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.token || !body.password) return jsonError("Token and new password are required");
    return ok(await resetPasswordWithToken(String(body.token), String(body.password)));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Reset failed", 400);
  }
}
