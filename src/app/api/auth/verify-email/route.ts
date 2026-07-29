import { ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";
import { confirmEmailWithToken } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.token) return jsonError("Missing verification token");
    return ok(await confirmEmailWithToken(String(body.token)));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Verification failed", 400);
  }
}
