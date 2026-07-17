import { logout, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.refreshToken) await logout(body.refreshToken);
    return ok({ success: true });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Logout failed", 500);
  }
}
