import { NextResponse } from "next/server";
import { CampaignStatus, PayoutStatus, UserRole } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira } from "@/server/money";
import {
  notifyEmail,
  processPendingNotifications,
} from "@/server/services/notifications.service";
import * as Email from "@/server/emails/templates";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.campaign.updateMany({
    where: { status: CampaignStatus.active, endDate: { lt: now } },
    data: { status: CampaignStatus.ended },
  });

  const exhausted = await prisma.campaign.updateMany({
    where: { status: CampaignStatus.active, remainingKobo: { lte: 0 } },
    data: { status: CampaignStatus.exhausted },
  });

  // Campaigns ending within 48 hours
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const endingSoon = await prisma.campaign.findMany({
    where: {
      status: CampaignStatus.active,
      endDate: { gt: now, lte: in48h },
    },
    include: {
      funderProfile: true,
      participations: { select: { clipperId: true } },
    },
  });

  let endingSoonEmails = 0;
  for (const c of endingSoon) {
    const end = c.endDate!.toISOString().slice(0, 10);
    const recent = await prisma.notification.findFirst({
      where: {
        userId: c.funderProfile.userId,
        subject: "Campaign ending soon",
        createdAt: { gt: new Date(now.getTime() - 36 * 60 * 60 * 1000) },
      },
    });
    if (!recent) {
      await notifyEmail(
        c.funderProfile.userId,
        Email.campaignEndingSoon(c.name, end, "funder"),
        { campaignId: c.id },
      );
      endingSoonEmails++;
      for (const p of c.participations) {
        await notifyEmail(
          p.clipperId,
          Email.campaignEndingSoon(c.name, end, "clipper"),
          { campaignId: c.id },
        );
        endingSoonEmails++;
      }
    }
  }

  // Weekly earnings summary — Mondays only (UTC)
  let weeklyEmails = 0;
  if (now.getUTCDay() === 1) {
    const clippers = await prisma.user.findMany({
      where: { role: UserRole.clipper, status: "active" },
      select: { id: true },
      take: 500,
    });
    const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    for (const clipper of clippers) {
      const already = await prisma.notification.findFirst({
        where: {
          userId: clipper.id,
          subject: "Your weekly KudiClip summary",
          createdAt: { gt: weekAgo },
        },
      });
      if (already) continue;

      const [submissions, payoutItems] = await Promise.all([
        prisma.clipSubmission.findMany({
          where: { clipperId: clipper.id },
          select: { earningsKobo: true, viewsVerified: true },
        }),
        prisma.payoutItem.findMany({
          where: { clipperId: clipper.id },
          select: { status: true, amountKobo: true },
        }),
      ]);
      const totalEarned = submissions.reduce((s, x) => s + (x.earningsKobo ?? 0), 0);
      const paid = payoutItems
        .filter((p) => p.status === PayoutStatus.paid)
        .reduce((s, p) => s + p.amountKobo, 0);
      const pending = Math.max(0, totalEarned - paid);
      const clipsVerified = submissions.filter((s) => (s.viewsVerified ?? 0) > 0).length;
      if (totalEarned === 0 && clipsVerified === 0) continue;

      await notifyEmail(
        clipper.id,
        Email.weeklyEarningsSummary({
          totalEarnedNaira: koboToNaira(totalEarned),
          pendingNaira: koboToNaira(pending),
          paidNaira: koboToNaira(paid),
          clipsVerified,
        }),
      );
      weeklyEmails++;
    }
  }

  const notificationsProcessed = await processPendingNotifications(50);

  return NextResponse.json({
    expiredCampaigns: expired.count,
    exhaustedCampaigns: exhausted.count,
    endingSoonEmails,
    weeklyEmails,
    notificationsProcessed,
  });
}
