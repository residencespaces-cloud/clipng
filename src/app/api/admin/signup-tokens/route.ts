import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import {
  createSignupToken,
  listSignupTokens,
} from "@/server/services/signup-tokens.service";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    return ok(await listSignupTokens());
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to list tokens", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request, ["admin"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const createdFor = String(body.createdFor ?? "").trim();
    const creditNaira = Number(body.creditNaira);
    if (!createdFor) return jsonError("Created for is required");
    if (!Number.isFinite(creditNaira)) return jsonError("Credit amount is required");

    const token = await createSignupToken({
      createdFor,
      creditNaira,
      adminId: auth.user.id,
    });
    return ok(token, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create token";
    if (msg.includes("at least") || msg.includes("who this token")) {
      return jsonError(msg, 400);
    }
    return jsonError(msg, 500);
  }
}
