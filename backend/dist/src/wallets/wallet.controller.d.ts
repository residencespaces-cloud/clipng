import { WalletService } from './wallet.service';
declare class TopUpDto {
    amount: number;
}
export declare class WalletController {
    private wallet;
    constructor(wallet: WalletService);
    getBalance(req: {
        user: {
            id: string;
        };
    }): Promise<{
        balance: number;
        escrow: number;
        balanceKobo: number;
    }>;
    getTransactions(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        date: string;
        type: string;
        description: string;
        amount: number;
        balanceAfter: number;
    }[]>;
    initiateTopUp(req: {
        user: {
            id: string;
        };
    }, dto: TopUpDto): Promise<{
        reference: string;
        amount: number;
        amountKobo: number;
        authorizationUrl: string;
        publicKey: string | undefined;
        message: string;
    }>;
}
export {};
