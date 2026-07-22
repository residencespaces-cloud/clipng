import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { hashToken, issueTokens } from "@/server/auth";
import { createTransferRecipient, resolveAccountNumber } from "@/server/paystack";
import { isValidEmail, isValidPassword, isValidPhone } from "@/server/validation";
import { notifyUser } from "@/server/services/notifications.service";

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
    await notifyUser(
      user.id,
      "Welcome to KudiClip",
      `Hi ${body.name}, your clipper account is ready. Browse live campaigns and start earning.`,
    );
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
}) {
  if (!isValidEmail(body.email)) throw new Error("Enter a valid email address.");
  if (!isValidPassword(body.password)) throw new Error("Password must be at least 8 characters.");
  if (!isValidPhone(body.phone)) throw new Error("Enter a valid phone number.");

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
    });
    await notifyUser(
      user.id,
      "Welcome to KudiClip",
      `Hi ${body.business}, your funder account is ready. Fund your wallet and launch your first campaign.`,
    );
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

  await prisma.funderProfile.update({
    where: { userId },
    data: {
      businessName: body.businessName,
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
    bankName: user.clipperProfile?.bankName,
    accountNumber: user.clipperProfile?.accountNumber,
    businessName: user.funderProfile?.businessName,
    phone: user.clipperProfile?.phone ?? user.funderProfile?.phone,
  };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
