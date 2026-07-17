import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { hashToken, issueTokens } from "@/server/auth";

export async function signupClipper(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  bankName: string;
  accountNumber: string;
}) {
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      role: UserRole.clipper,
      clipperProfile: {
        create: {
          displayName: body.name,
          phone: body.phone,
          bankName: body.bankName,
          accountNumber: body.accountNumber,
        },
      },
    },
  });
  return issueTokens(user);
}

export async function signupFunder(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  business: string;
}) {
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      role: UserRole.funder,
      funderProfile: {
        create: {
          businessName: body.business,
          phone: body.phone,
          wallet: { create: {} },
        },
      },
    },
  });
  return issueTokens(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw Object.assign(new Error("No account found with that email. Create an account first."), {
      status: 404,
      code: "ACCOUNT_NOT_FOUND",
    });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Incorrect password. Try again."), {
      status: 401,
      code: "INVALID_PASSWORD",
    });
  }
  if (user.status === "suspended") {
    throw Object.assign(new Error("This account has been suspended. Contact support."), {
      status: 403,
      code: "ACCOUNT_SUSPENDED",
    });
  }
  return issueTokens(user);
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!stored) return null;
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  return issueTokens(stored.user);
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(refreshToken) } });
  return { success: true };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clipperProfile: true, funderProfile: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name:
      user.clipperProfile?.displayName ??
      user.funderProfile?.businessName ??
      user.email,
    status: user.status,
  };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
