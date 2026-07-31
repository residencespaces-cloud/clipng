import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { hashToken, issueTokens } from "@/server/auth";
import { createTransferRecipient, resolveAccountNumber } from "@/server/paystack";
import { isValidEmail, isValidPassword, isValidPhone } from "@/server/validation";
import {
  notifyEmail,
  sendLoginAlert,
  sendPasswordResetEmail,
  sendVerifyEmail,
} from "@/server/services/notifications.service";
import { verifyEmailActionToken } from "@/server/emails/tokens";
import * as Email from "@/server/emails/templates";
import { redeemSignupToken } from "@/server/services/signup-tokens.service";

async function verifyAndCreateRecipient(
  bankCode: string,
  bankName: string,
  accountNumber: string,
) {
  const resolved = await resolveAccountNumber(accountNumber, bankCode);
  const acct = resolved.account_number;
  const accountName = resolved.account_name;

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      bankName,
      accountNumber: acct,
      accountName,
      recipientCode: `dev_recipient_${acct}`,
    };
  }

  const recipient = await createTransferRecipient({
    name: accountName,
    accountNumber: acct,
    bankCode,
  });

  return {
    bankName,
    accountNumber: acct,
    accountName,
    recipientCode: recipient.recipient_code,
  };
}

export async function signupClipper(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
}) {
  if (!isValidEmail(body.email)) throw new Error("Enter a valid email address.");
  if (!isValidPassword(body.password)) throw new Error("Password must be at least 8 characters.");
  if (!isValidPhone(body.phone)) throw new Error("Enter a valid phone number.");
  if (body.name.trim().toLowerCase() === body.password.toLowerCase()) {
    throw new Error("Full name cannot be the same as your password.");
  }
  if (!body.bankCode?.trim()) throw new Error("Select your bank.");

  let bankDetails: Awaited<ReturnType<typeof verifyAndCreateRecipient>>;
  try {
    bankDetails = await verifyAndCreateRecipient(body.bankCode, body.bankName, body.accountNumber);
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : "Could not verify bank details with Paystack.",
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        role: UserRole.clipper,
        clipperProfile: {
          create: {
            displayName: body.name,
            phone: body.phone,
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            paystackRecipientCode: bankDetails.recipientCode,
          },
        },
      },
    });
    await notifyEmail(user.id, Email.welcomeClipper(body.name));
    await sendVerifyEmail(user.id, user.email, body.name);
    return issueTokens(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("An account with this email already exists.");
    }
    throw e;
  }
}

export async function signupFunder(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  business: string;
  signupToken?: string;
}) {
  if (!isValidEmail(body.email)) throw new Error("Enter a valid email address.");
  if (!isValidPassword(body.password)) throw new Error("Password must be at least 8 characters.");
  if (!isValidPhone(body.phone)) throw new Error("Enter a valid phone number.");
  if (!body.business?.trim()) throw new Error("Business / brand name is required.");
  if (body.business.trim().toLowerCase() === body.password.toLowerCase()) {
    throw new Error("Business name cannot be the same as your password.");
  }
  if (body.name.trim().toLowerCase() === body.password.toLowerCase()) {
    throw new Error("Full name cannot be the same as your password.");
  }

  const tokenCode = body.signupToken?.trim();
  if (tokenCode) {
    const existing = await prisma.signupToken.findUnique({
      where: { code: tokenCode.toUpperCase() },
    });
    if (!existing) throw new Error("Invalid signup token.");
    if (existing.usedByUserId) throw new Error("This signup token has already been used.");
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  try {
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
      include: { funderProfile: { include: { wallet: true } } },
    });

    const walletId = user.funderProfile?.wallet?.id;
    if (tokenCode && walletId) {
      try {
        await redeemSignupToken({
          code: tokenCode,
          userId: user.id,
          walletId,
        });
      } catch (redeemError) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
        throw redeemError;
      }
    }

    await notifyEmail(user.id, Email.welcomeFunder(body.business, Boolean(tokenCode)));
    await sendVerifyEmail(user.id, user.email, body.business);
    return issueTokens(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("An account with this email already exists.");
    }
    throw e;
  }
}

export async function updateClipperProfile(
  userId: string,
  body: { bankCode: string; bankName: string; accountNumber: string },
) {
  const profile = await prisma.clipperProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Clipper profile not found");
  if (!body.bankCode?.trim()) throw new Error("Select your bank.");

  const bankDetails = await verifyAndCreateRecipient(body.bankCode, body.bankName, body.accountNumber);

  await prisma.clipperProfile.update({
    where: { userId },
    data: {
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      paystackRecipientCode: bankDetails.recipientCode,
    },
  });

  return { success: true, accountName: bankDetails.accountName };
}

export async function updateFunderProfile(
  userId: string,
  body: { businessName: string; phone?: string },
) {
  const profile = await prisma.funderProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Funder profile not found");
  if (!body.businessName?.trim()) throw new Error("Business name is required");

  await prisma.funderProfile.update({
    where: { userId },
    data: {
      businessName: body.businessName.trim(),
      phone: body.phone ?? profile.phone,
    },
  });

  return { success: true };
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
  if (user.status === "pending_verification") {
    throw Object.assign(new Error("Verify your email before signing in."), {
      status: 403,
      code: "EMAIL_NOT_VERIFIED",
    });
  }
  const tokens = await issueTokens(user);
  void sendLoginAlert(user.id, user.email);
  return tokens;
}

export async function requestPasswordReset(email: string) {
  if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Always succeed so we don't leak whether the account exists
  if (!user) return { success: true };
  await sendPasswordResetEmail(user.id, user.email);
  return { success: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!isValidPassword(newPassword)) throw new Error("Password must be at least 8 characters.");
  const { userId, email } = await verifyEmailActionToken(token, "reset_password");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== email) throw new Error("Invalid or expired link");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);
  return { success: true };
}

export async function confirmEmailWithToken(token: string) {
  const { userId, email } = await verifyEmailActionToken(token, "verify_email");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== email) throw new Error("Invalid or expired link");

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      status: user.status === "pending_verification" ? "active" : user.status,
    },
  });
  return { success: true };
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
    bankName: user.clipperProfile?.bankName,
    accountNumber: user.clipperProfile?.accountNumber,
    businessName: user.funderProfile?.businessName,
    phone: user.clipperProfile?.phone ?? user.funderProfile?.phone,
  };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
