import { randomBytes } from "crypto";
import { WalletLedgerType } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, nairaToKobo } from "@/server/money";

function generateCode() {
  const raw = randomBytes(5).toString("hex").toUpperCase().slice(0, 8);
  return `KC-${raw}`;
}

export async function createSignupToken(params: {
  createdFor: string;
  creditNaira: number;
  adminId: string;
}) {
  const createdFor = params.createdFor.trim();
  if (!createdFor) throw new Error("Enter who this token is for (e.g. studio name).");
  if (!Number.isFinite(params.creditNaira) || params.creditNaira < 100) {
    throw new Error("Credit amount must be at least ₦100.");
  }

  const creditKobo = BigInt(nairaToKobo(params.creditNaira));
  let code = generateCode();
  for (let i = 0; i < 5; i++) {
    try {
      const token = await prisma.signupToken.create({
        data: {
          code,
          createdFor,
          creditKobo,
          createdByAdminId: params.adminId,
        },
      });
      return {
        id: token.id,
        code: token.code,
        createdFor: token.createdFor,
        creditNaira: koboToNaira(token.creditKobo),
        createdAt: token.createdAt.toISOString(),
        used: false,
      };
    } catch (e) {
      const isUnique =
        e instanceof Error && "code" in e && (e as { code?: string }).code === "P2002";
      if (!isUnique) throw e;
      code = generateCode();
    }
  }
  throw new Error("Could not generate a unique token. Try again.");
}

export async function listSignupTokens() {
  const tokens = await prisma.signupToken.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedByUser: { select: { email: true } },
      createdByAdmin: { select: { email: true } },
    },
  });

  return tokens.map((t) => ({
    id: t.id,
    code: t.code,
    createdFor: t.createdFor,
    creditNaira: koboToNaira(t.creditKobo),
    used: Boolean(t.usedByUserId),
    usedByEmail: t.usedByUser?.email ?? null,
    usedAt: t.usedAt?.toISOString() ?? null,
    createdByEmail: t.createdByAdmin?.email ?? null,
    createdAt: t.createdAt.toISOString(),
  }));
}

/** Claim a single-use token and credit the funder's wallet. Call inside or after user+wallet create. */
export async function redeemSignupToken(params: {
  code: string;
  userId: string;
  walletId: string;
}) {
  const code = params.code.trim().toUpperCase();
  if (!code) throw new Error("Signup token is empty.");

  await prisma.$transaction(async (tx) => {
    const token = await tx.signupToken.findUnique({ where: { code } });
    if (!token) throw new Error("Invalid signup token.");
    if (token.usedByUserId) throw new Error("This signup token has already been used.");

    const claimed = await tx.signupToken.updateMany({
      where: { id: token.id, usedByUserId: null },
      data: {
        usedByUserId: params.userId,
        usedAt: new Date(),
      },
    });
    if (claimed.count !== 1) {
      throw new Error("This signup token has already been used.");
    }

    const wallet = await tx.wallet.update({
      where: { id: params.walletId },
      data: { balanceKobo: { increment: token.creditKobo } },
    });

    await tx.walletLedgerEntry.create({
      data: {
        walletId: params.walletId,
        type: WalletLedgerType.signup_credit,
        amountKobo: token.creditKobo,
        balanceAfterKobo: wallet.balanceKobo,
        description: `Signup credit for ${token.createdFor}`,
        reference: `signup_token_${token.id}`,
        metadata: { tokenCode: token.code, createdFor: token.createdFor },
      },
    });
  });
}
