import { WalletLedgerType, Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, nairaToKobo } from "@/server/money";

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
    type: e.type === WalletLedgerType.top_up ? "top_up" : "campaign_escrow",
    description: e.description,
    amount: koboToNaira(e.amountKobo),
    balanceAfter: koboToNaira(e.balanceAfterKobo),
  }));
}

export async function initiateTopUp(userId: string, amountNaira: number) {
  if (amountNaira <= 0) throw new Error("Amount must be positive");
  const wallet = await getWalletForFunder(userId);
  const reference = `topup_${wallet.id}_${Date.now()}`;
  return {
    reference,
    amount: amountNaira,
    amountKobo: nairaToKobo(amountNaira),
    authorizationUrl: `https://checkout.paystack.com/demo?ref=${reference}`,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    message: "Use Paystack checkout. Webhook will credit wallet on success.",
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

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
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
