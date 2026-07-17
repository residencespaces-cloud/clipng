import { NextResponse } from "next/server";
import { login, ok } from "@/server/services/auth.service";
import { jsonError } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email || !body.password) {
      return jsonError("Email and password required");
    }
    const tokens = await login(body.email, body.password);
    if (!tokens) return jsonError("Invalid credentials", 401);
    return ok(tokens);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Login failed", 500);
  }
}
