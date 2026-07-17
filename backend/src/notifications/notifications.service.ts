import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async queueEmail(userId: string, subject: string, body: string, metadata?: Record<string, unknown>) {
    return this.prisma.notification.create({
      data: {
        userId,
        channel: NotificationChannel.email,
        status: NotificationStatus.pending,
        subject,
        body,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async processPending(limit = 20) {
    const pending = await this.prisma.notification.findMany({
      where: { status: NotificationStatus.pending },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    for (const n of pending) {
      await this.prisma.notification.update({
        where: { id: n.id },
        data: { status: NotificationStatus.sent, sentAt: new Date() },
      });
    }

    return { processed: pending.length };
  }
}
