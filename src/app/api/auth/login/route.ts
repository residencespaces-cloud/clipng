import { login, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";
import { rateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return jsonError("Too many login attempts. Try again in a minute.", 429);
  }
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
