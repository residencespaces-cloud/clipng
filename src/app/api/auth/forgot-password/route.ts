import { ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";
import { requestPasswordReset } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) return jsonError("Enter your email address");
    return ok(await requestPasswordReset(String(body.email).trim()));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
