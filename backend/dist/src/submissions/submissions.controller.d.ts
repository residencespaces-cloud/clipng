import { CreateSubmissionDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';
export declare class SubmissionsController {
    private submissions;
    constructor(submissions: SubmissionsService);
    create(req: {
        user: {
            id: string;
        };
    }, dto: CreateSubmissionDto): Promise<{
        id: string;
        campaign: string;
        platform: string;
        date: string;
        status: string;
        views: number;
        earnings: number;
    }>;
    listMine(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        campaign: string;
        platform: string;
        date: string;
        status: string;
        views: number;
        earnings: number;
    }[]>;
    earnings(req: {
        user: {
            id: string;
        };
    }): Promise<{
        totalEarned: number;
        pendingThisWeek: number;
        paidOut: number;
    }>;
}
