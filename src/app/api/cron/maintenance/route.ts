import { NextResponse } from "next/server";
import { CampaignStatus, NotificationStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expired = await prisma.campaign.updateMany({
    where: { status: CampaignStatus.active, endDate: { lt: now } },
    data: { status: CampaignStatus.ended },
  });

  const pending = await prisma.notification.findMany({
    where: { status: NotificationStatus.pending },
    take: 50,
  });
  for (const n of pending) {
    await prisma.notification.update({
      where: { id: n.id },
      data: { status: NotificationStatus.sent, sentAt: new Date() },
    });
  }

  return NextResponse.json({
    expiredCampaigns: expired.count,
    notificationsProcessed: pending.length,
  });
}
