import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    queueEmail(userId: string, subject: string, body: string, metadata?: Record<string, unknown>): Promise<{
        id: string;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userId: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        subject: string;
        body: string;
        sentAt: Date | null;
    }>;
    processPending(limit?: number): Promise<{
        processed: number;
    }>;
}
