import { NextResponse } from "next/server";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { processPendingNotifications } from "@/server/services/notifications.service";

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

  const notificationsProcessed = await processPendingNotifications(50);

  return NextResponse.json({
    expiredCampaigns: expired.count,
    exhaustedCampaigns: exhausted.count,
    notificationsProcessed,
  });
}
