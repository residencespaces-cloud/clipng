import { login, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email || !body.password) {
      return jsonError("Enter your email and password to continue.");
    }
    const tokens = await login(String(body.email).trim(), String(body.password));
    return ok(tokens);
  } catch (e) {
    const err = e as Error & { status?: number };
    const status = err.status ?? 500;
    return jsonError(err.message || "Login failed", status);
  }
}
