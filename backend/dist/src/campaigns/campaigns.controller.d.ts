import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/campaign.dto';
export declare class CampaignsController {
    private campaigns;
    constructor(campaigns: CampaignsService);
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
    listMy(req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    create(req: {
        user: {
            id: string;
        };
    }, dto: CreateCampaignDto): Promise<{
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
    join(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        verificationCode: string;
    }>;
}
