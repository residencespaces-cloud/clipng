import { SourceType } from '@prisma/client';
export declare class CreateCampaignDto {
    name: string;
    sourceType: SourceType;
    assetUrl?: string;
    bestMoments?: string;
    description: string;
    platforms: string[];
    cpm: number;
    budget: number;
    start?: string;
    end?: string;
    imageUrl?: string;
}
