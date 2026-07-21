import { signupClipper, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["name", "email", "phone", "password", "bankCode", "bankName", "accountNumber"];
    for (const key of required) {
      if (!body[key]) return jsonError(`${key} is required`);
    }
    const tokens = await signupClipper(body);
    return ok(tokens, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signup failed";
    if (msg.includes("Unique constraint") || msg.includes("already exists")) {
      return jsonError("Email already registered", 409);
    }
    if (
      msg.includes("valid") ||
      msg.includes("Select your bank") ||
      msg.includes("resolve") ||
      msg.includes("Paystack") ||
      msg.includes("verify")
    ) {
      return jsonError(msg, 400);
    }
    return jsonError(msg, 500);
  }
}
