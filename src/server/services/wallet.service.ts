import { WalletLedgerType, Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, nairaToKobo } from "@/server/money";
import { initializeTransaction } from "@/server/paystack";
import { notifyUser } from "@/server/services/notifications.service";

export async function getWalletForFunder(userId: string) {
  const profile = await prisma.funderProfile.findUnique({
    where: { userId },
    include: { wallet: true },
  });
  if (!profile?.wallet) throw new Error("Wallet not found");
  return profile.wallet;
}

export async function getBalance(userId: string) {
  const wallet = await getWalletForFunder(userId);
  return {
    balance: koboToNaira(wallet.balanceKobo),
    escrow: koboToNaira(wallet.escrowKobo),
    balanceKobo: Number(wallet.balanceKobo),
  };
}

function mapLedgerType(type: WalletLedgerType): "top_up" | "campaign_escrow" | "escrow_release" | "refund" | "adjustment" {
  switch (type) {
    case WalletLedgerType.top_up:
      return "top_up";
    case WalletLedgerType.campaign_escrow:
      return "campaign_escrow";
    case WalletLedgerType.escrow_release:
      return "escrow_release";
    case WalletLedgerType.refund:
      return "refund";
    case WalletLedgerType.payout_debit:
    case WalletLedgerType.adjustment:
      return "adjustment";
    default:
      return "adjustment";
  }
}

export async function getTransactions(userId: string) {
  const wallet = await getWalletForFunder(userId);
  const entries = await prisma.walletLedgerEntry.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return entries.map((e) => ({
    id: e.id,
    date: e.createdAt.toISOString().slice(0, 10),
    type: mapLedgerType(e.type),
    description: e.description,
    amount: koboToNaira(e.amountKobo),
    balanceAfter: koboToNaira(e.balanceAfterKobo),
  }));
}

export async function initiateTopUp(userId: string, amountNaira: number, callbackUrl?: string) {
  if (amountNaira <= 0) throw new Error("Amount must be positive");
  const wallet = await getWalletForFunder(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const reference = `topup_${wallet.id}_${Date.now()}`;
  const amountKobo = nairaToKobo(amountNaira);

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      reference,
      amount: amountNaira,
      amountKobo,
      authorizationUrl: callbackUrl ?? "/funder?topup=success",
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      message: "Paystack not configured — set PAYSTACK_SECRET_KEY for live payments.",
    };
  }

  const data = await initializeTransaction({
    email: user.email,
    amountKobo,
    reference,
    callbackUrl,
    metadata: { walletId: wallet.id, userId },
  });

  return {
    reference,
    amount: amountNaira,
    amountKobo,
    authorizationUrl: data.authorization_url,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    message: "Redirect to Paystack checkout. Wallet credits on successful payment.",
  };
}

export async function creditTopUp(
  reference: string,
  amountKobo: number,
  metadata?: Record<string, unknown>,
) {
  const existing = await prisma.walletLedgerEntry.findUnique({ where: { reference } });
  if (existing) return existing;

  const walletId = (metadata?.walletId as string) ?? null;
  if (!walletId) throw new Error("Missing walletId in webhook metadata");

  const entry = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
      include: { funderProfile: true },
    });
    const newBalance = wallet.balanceKobo + BigInt(amountKobo);
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceKobo: newBalance },
    });
    return tx.walletLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: WalletLedgerType.top_up,
        amountKobo: BigInt(amountKobo),
        balanceAfterKobo: newBalance,
        description: "Wallet top-up via Paystack",
        reference,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  });

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: { funderProfile: true },
  });
  if (wallet?.funderProfile) {
    const funder = await prisma.user.findUnique({
      where: { id: wallet.funderProfile.userId },
    });
    if (funder) {
      await notifyUser(
        funder.id,
        "Wallet topped up",
        `Your wallet was credited with ₦${koboToNaira(amountKobo).toLocaleString()}.`,
        { reference },
      );
    }
  }

  return entry;
}

export async function reserveEscrowForCampaign(
  userId: string,
  campaignId: string,
  campaignName: string,
  budgetKobo: number,
) {
  const wallet = await getWalletForFunder(userId);
  if (wallet.balanceKobo < BigInt(budgetKobo)) {
    throw new Error("Insufficient wallet balance");
  }

  const reference = `escrow_${campaignId}`;

  return prisma.$transaction(async (tx) => {
    const fresh = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
    if (fresh.balanceKobo < BigInt(budgetKobo)) {
      throw new Error("Insufficient wallet balance");
    }
    const newBalance = fresh.balanceKobo - BigInt(budgetKobo);
    const newEscrow = fresh.escrowKobo + BigInt(budgetKobo);
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceKobo: newBalance, escrowKobo: newEscrow },
    });
    await tx.walletLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: WalletLedgerType.campaign_escrow,
        amountKobo: BigInt(-budgetKobo),
        balanceAfterKobo: newBalance,
        description: `${campaignName} (escrow)`,
        reference,
        campaignId,
      },
    });
    return { success: true };
  });
}
