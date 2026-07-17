import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletLedgerType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { koboToNaira, nairaToKobo } from '../common/utils/money';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  async getWalletForFunder(userId: string) {
    const profile = await this.prisma.funderProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!profile?.wallet) throw new BadRequestException('Wallet not found');
    return profile.wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.getWalletForFunder(userId);
    return {
      balance: koboToNaira(wallet.balanceKobo),
      escrow: koboToNaira(wallet.escrowKobo),
      balanceKobo: Number(wallet.balanceKobo),
    };
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWalletForFunder(userId);
    const entries = await this.prisma.walletLedgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return entries.map((e) => ({
      id: e.id,
      date: e.createdAt.toISOString().slice(0, 10),
      type: e.type === WalletLedgerType.top_up ? 'top_up' : 'campaign_escrow',
      description: e.description,
      amount: koboToNaira(e.amountKobo),
      balanceAfter: koboToNaira(e.balanceAfterKobo),
    }));
  }

  async initiateTopUp(userId: string, amountNaira: number) {
    if (amountNaira <= 0) throw new BadRequestException('Amount must be positive');
    const wallet = await this.getWalletForFunder(userId);
    const reference = `topup_${wallet.id}_${Date.now()}`;
    const amountKobo = nairaToKobo(amountNaira);

    // In production: call Paystack initialize transaction API
    const paystackPublicKey = this.config.get<string>('PAYSTACK_PUBLIC_KEY');
    return {
      reference,
      amount: amountNaira,
      amountKobo,
      authorizationUrl: `https://checkout.paystack.com/demo?ref=${reference}`,
      publicKey: paystackPublicKey,
      message: 'Use Paystack checkout. Webhook will credit wallet on success.',
    };
  }

  async creditTopUp(reference: string, amountKobo: number, metadata?: Record<string, unknown>) {
    const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
    if (existing) return existing;

    const walletId = (metadata?.walletId as string) ?? null;
    if (!walletId) throw new BadRequestException('Missing walletId in webhook metadata');

    return this.prisma.$transaction(async (tx) => {
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
          description: 'Wallet top-up via Paystack',
          reference,
          metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    });
  }

  async reserveEscrowForCampaign(
    userId: string,
    campaignId: string,
    campaignName: string,
    budgetKobo: number,
  ) {
    const wallet = await this.getWalletForFunder(userId);
    if (wallet.balanceKobo < BigInt(budgetKobo)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const reference = `escrow_${campaignId}`;

    return this.prisma.$transaction(async (tx) => {
      const fresh = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
      if (fresh.balanceKobo < BigInt(budgetKobo)) {
        throw new BadRequestException('Insufficient wallet balance');
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
}
