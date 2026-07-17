import { refresh, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.refreshToken) return jsonError("refreshToken required");
    const tokens = await refresh(body.refreshToken);
    if (!tokens) return jsonError("Invalid refresh token", 401);
    return ok(tokens);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Refresh failed", 500);
  }
}
