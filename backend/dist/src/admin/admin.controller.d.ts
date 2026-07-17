import { AdminService } from './admin.service';
declare class ApproveDto {
    codeVerified: boolean;
}
declare class RejectDto {
    reason?: string;
}
declare class VerifyViewsDto {
    viewCount: number;
}
export declare class AdminController {
    private admin;
    constructor(admin: AdminService);
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
    listPayouts(): Promise<{
        id: string;
        date: string;
        clipper: string;
        campaign: string;
        amount: number;
        status: string;
    }[]>;
    approve(req: {
        user: {
            id: string;
        };
    }, id: string, dto: ApproveDto): Promise<{
        success: boolean;
    }>;
    reject(req: {
        user: {
            id: string;
        };
    }, id: string, dto: RejectDto): Promise<{
        success: boolean;
    }>;
    verifyViews(req: {
        user: {
            id: string;
        };
    }, id: string, dto: VerifyViewsDto): Promise<{
        success: boolean;
        earnings: number;
    }>;
    triggerPayout(req: {
        user: {
            id: string;
        };
    }, id: string): Promise<{
        success: boolean;
        status: string;
    }>;
    listCampaigns(): Promise<{
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
    auditLogs(): Promise<{
        id: string;
        action: string;
        entityType: string;
        entityId: string | null;
        actor: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
export {};
