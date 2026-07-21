import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

export type AuthUser = { id: string; email: string; role: UserRole };

function accessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_ACCESS_SECRET must be set in production");
  }
  return new TextEncoder().encode(secret ?? "dev-access-secret-change-me-32chars");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(user: AuthUser) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret());
}

export async function issueTokens(user: AuthUser) {
  const accessToken = await signAccessToken(user);
  const refreshToken = randomBytes(48).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), accessSecret());
    const id = payload.sub;
    if (!id) return null;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.status !== "active") return null;
    return { id: user.id, email: user.email, role: user.role };
  } catch {
    return null;
  }
}

export async function requireUser(request: Request, roles?: UserRole[]) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ message: "Insufficient permissions" }, { status: 403 }) };
  }
  return { user };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}
