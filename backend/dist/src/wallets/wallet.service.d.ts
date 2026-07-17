import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class WalletService {
    private prisma;
    private audit;
    private config;
    constructor(prisma: PrismaService, audit: AuditService, config: ConfigService);
    getWalletForFunder(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        funderProfileId: string;
        balanceKobo: bigint;
        escrowKobo: bigint;
    }>;
    getBalance(userId: string): Promise<{
        balance: number;
        escrow: number;
        balanceKobo: number;
    }>;
    getTransactions(userId: string): Promise<{
        id: string;
        date: string;
        type: string;
        description: string;
        amount: number;
        balanceAfter: number;
    }[]>;
    initiateTopUp(userId: string, amountNaira: number): Promise<{
        reference: string;
        amount: number;
        amountKobo: number;
        authorizationUrl: string;
        publicKey: string | undefined;
        message: string;
    }>;
    creditTopUp(reference: string, amountKobo: number, metadata?: Record<string, unknown>): Promise<{
        id: string;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        campaignId: string | null;
        description: string;
        amountKobo: bigint;
        walletId: string;
        type: import(".prisma/client").$Enums.WalletLedgerType;
        balanceAfterKobo: bigint;
        reference: string | null;
    }>;
    reserveEscrowForCampaign(userId: string, campaignId: string, campaignName: string, budgetKobo: number): Promise<{
        success: boolean;
    }>;
}
