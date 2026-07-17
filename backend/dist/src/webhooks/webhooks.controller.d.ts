import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';
export declare class WebhooksController {
    private prisma;
    private wallet;
    private config;
    constructor(prisma: PrismaService, wallet: WalletService, config: ConfigService);
    private verifyPaystackSignature;
    paystack(body: Record<string, unknown>, signature: string | undefined): Promise<{
        received: boolean;
        warning?: undefined;
    } | {
        received: boolean;
        warning: string;
    }>;
}
