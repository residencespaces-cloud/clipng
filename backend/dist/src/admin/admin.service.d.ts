import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class AdminService {
    private prisma;
    private audit;
    private config;
    constructor(prisma: PrismaService, audit: AuditService, config: ConfigService);
    private mapPendingRow;
    listPending(): Promise<{
        id: string;
        clipper: string;
        campaign: string;
        platform: string;
        link: string;
        verificationCode: string;
        date: string;
        views: number;
        status: import(".prisma/client").$Enums.SubmissionStatus;
    }[]>;
    listAwaitingViews(): Promise<{
        approvedDate: string;
        viewCount: string;
        id: string;
        clipper: string;
        campaign: string;
        platform: string;
        link: string;
        verificationCode: string;
        date: string;
        views: number;
        status: import(".prisma/client").$Enums.SubmissionStatus;
    }[]>;
    listReadyForPayout(): Promise<{
        viewsVerified: number;
        approvedDate: string;
        earningsDue: number;
        payoutStatus: string;
        id: string;
        clipper: string;
        campaign: string;
        platform: string;
        link: string;
        verificationCode: string;
        date: string;
        views: number;
        status: import(".prisma/client").$Enums.SubmissionStatus;
    }[]>;
    approveSubmission(adminId: string, submissionId: string, codeVerified: boolean): Promise<{
        success: boolean;
    }>;
    rejectSubmission(adminId: string, submissionId: string, reason?: string): Promise<{
        success: boolean;
    }>;
    verifyViews(adminId: string, submissionId: string, viewCount: number): Promise<{
        success: boolean;
        earnings: number;
    }>;
    triggerPayout(adminId: string, submissionId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    listAllCampaigns(): Promise<{
        id: string;
        name: string;
        funder: string;
        cpm: number;
        budget: number;
        remaining: number;
        views: number;
        clips: number;
        platforms: string[];
        status: import(".prisma/client").$Enums.CampaignStatus;
        end: string;
    }[]>;
    listPayouts(): Promise<{
        id: string;
        date: string;
        clipper: string;
        campaign: string;
        amount: number;
        status: string;
    }[]>;
    listAuditLogs(): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        actor: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
