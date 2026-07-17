import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/submission.dto';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateSubmissionDto): Promise<{
        id: string;
        campaign: string;
        platform: string;
        date: string;
        status: string;
        views: number;
        earnings: number;
    }>;
    private mapMyClip;
    listMine(userId: string): Promise<{
        id: string;
        campaign: string;
        platform: string;
        date: string;
        status: string;
        views: number;
        earnings: number;
    }[]>;
    getEarningsSummary(userId: string): Promise<{
        totalEarned: number;
        pendingThisWeek: number;
        paidOut: number;
    }>;
}
