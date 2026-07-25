import { signupFunder, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "email", "phone", "password", "business"];
    for (const key of required) {
      if (!body[key]) return jsonError(`${key} is required`);
    }
    const tokens = await signupFunder({
      ...body,
      signupToken: body.signupToken ? String(body.signupToken) : undefined,
    });
    return ok(tokens, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    if (msg.includes("already exists") || msg.includes("Unique constraint")) {
      return jsonError("Email already registered", 409);
    }
    if (
      msg.includes("token") ||
      msg.includes("valid") ||
      msg.includes("phone") ||
      msg.includes("Password") ||
      msg.includes("email")
    ) {
      return jsonError(msg, 400);
    }
    return jsonError(msg, 500);
  }
}
