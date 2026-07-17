import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';
import { AuditService } from '../audit/audit.service';
import { CreateCampaignDto } from './dto/campaign.dto';
export declare class CampaignsService {
    private prisma;
    private wallet;
    private audit;
    constructor(prisma: PrismaService, wallet: WalletService, audit: AuditService);
    private mapCampaign;
    create(userId: string, dto: CreateCampaignDto): Promise<{
        id: string;
        name: string;
        funder: string;
        cpm: number;
        budget: number;
        remaining: number;
        views: number;
        clips: number;
        platforms: string[];
        status: string;
        end: string;
        description: string;
        asset: string;
        image: string;
    }>;
    listLive(): Promise<{
        id: string;
        name: string;
        funder: string;
        cpm: number;
        budget: number;
        remaining: number;
        views: number;
        clips: number;
        platforms: string[];
        status: string;
        end: string;
        description: string;
        asset: string;
        image: string;
    }[]>;
    listMy(userId: string): Promise<{
        id: string;
        name: string;
        funder: string;
        cpm: number;
        budget: number;
        remaining: number;
        views: number;
        clips: number;
        platforms: string[];
        status: string;
        end: string;
        description: string;
        asset: string;
        image: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        name: string;
        funder: string;
        cpm: number;
        budget: number;
        remaining: number;
        views: number;
        clips: number;
        platforms: string[];
        status: string;
        end: string;
        description: string;
        asset: string;
        image: string;
    }>;
    joinCampaign(userId: string, campaignId: string): Promise<{
        verificationCode: string;
    }>;
}
