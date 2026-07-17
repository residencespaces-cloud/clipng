import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CampaignStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireCampaigns() {
    const now = new Date();
    await this.prisma.campaign.updateMany({
      where: {
        status: CampaignStatus.active,
        endDate: { lt: now },
      },
      data: { status: CampaignStatus.ended },
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processNotifications() {
    await this.notifications.processPending();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async reconcileWebhooks() {
    const stale = await this.prisma.paymentWebhook.findMany({
      where: { processed: false },
      take: 50,
    });
    return { staleCount: stale.length };
  }
}
