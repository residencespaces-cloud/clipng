import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class JobsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    expireCampaigns(): Promise<void>;
    processNotifications(): Promise<void>;
    reconcileWebhooks(): Promise<{
        staleCount: number;
    }>;
}
