"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const money_1 = require("../common/utils/money");
let WalletService = class WalletService {
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
    }
    async getWalletForFunder(userId) {
        const profile = await this.prisma.funderProfile.findUnique({
            where: { userId },
            include: { wallet: true },
        });
        if (!profile?.wallet)
            throw new common_1.BadRequestException('Wallet not found');
        return profile.wallet;
    }
    async getBalance(userId) {
        const wallet = await this.getWalletForFunder(userId);
        return {
            balance: (0, money_1.koboToNaira)(wallet.balanceKobo),
            escrow: (0, money_1.koboToNaira)(wallet.escrowKobo),
            balanceKobo: Number(wallet.balanceKobo),
        };
    }
    async getTransactions(userId) {
        const wallet = await this.getWalletForFunder(userId);
        const entries = await this.prisma.walletLedgerEntry.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return entries.map((e) => ({
            id: e.id,
            date: e.createdAt.toISOString().slice(0, 10),
            type: e.type === client_1.WalletLedgerType.top_up ? 'top_up' : 'campaign_escrow',
            description: e.description,
            amount: (0, money_1.koboToNaira)(e.amountKobo),
            balanceAfter: (0, money_1.koboToNaira)(e.balanceAfterKobo),
        }));
    }
    async initiateTopUp(userId, amountNaira) {
        if (amountNaira <= 0)
            throw new common_1.BadRequestException('Amount must be positive');
        const wallet = await this.getWalletForFunder(userId);
        const reference = `topup_${wallet.id}_${Date.now()}`;
        const amountKobo = (0, money_1.nairaToKobo)(amountNaira);
        const paystackPublicKey = this.config.get('PAYSTACK_PUBLIC_KEY');
        return {
            reference,
            amount: amountNaira,
            amountKobo,
            authorizationUrl: `https://checkout.paystack.com/demo?ref=${reference}`,
            publicKey: paystackPublicKey,
            message: 'Use Paystack checkout. Webhook will credit wallet on success.',
        };
    }
    async creditTopUp(reference, amountKobo, metadata) {
        const existing = await this.prisma.walletLedgerEntry.findUnique({ where: { reference } });
        if (existing)
            return existing;
        const walletId = metadata?.walletId ?? null;
        if (!walletId)
            throw new common_1.BadRequestException('Missing walletId in webhook metadata');
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
                    type: client_1.WalletLedgerType.top_up,
                    amountKobo: BigInt(amountKobo),
                    balanceAfterKobo: newBalance,
                    description: 'Wallet top-up via Paystack',
                    reference,
                    metadata: (metadata ?? undefined),
                },
            });
        });
    }
    async reserveEscrowForCampaign(userId, campaignId, campaignName, budgetKobo) {
        const wallet = await this.getWalletForFunder(userId);
        if (wallet.balanceKobo < BigInt(budgetKobo)) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const reference = `escrow_${campaignId}`;
        return this.prisma.$transaction(async (tx) => {
            const fresh = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
            if (fresh.balanceKobo < BigInt(budgetKobo)) {
                throw new common_1.BadRequestException('Insufficient wallet balance');
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
                    type: client_1.WalletLedgerType.campaign_escrow,
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
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map