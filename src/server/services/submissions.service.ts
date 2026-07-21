import { Prisma } from "@prisma/client";
import { SubmissionStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { validatePublicPostUrl } from "@/server/submission-proof";
import { koboToNaira } from "@/server/money";
import { normalizeStatus } from "@/server/status";
import { notifyUser } from "@/server/services/notifications.service";

function mapMyClip(s: {
  id: string;
  platform: string;
  postUrl: string;
  status: SubmissionStatus;
  viewsVerified: number | null;
  earningsKobo: number | null;
  submittedAt: Date;
  campaign: { name: string };
}) {
  return {
    id: s.id,
    campaign: s.campaign.name,
    platform: s.platform,
    postUrl: s.postUrl,
    date: s.submittedAt.toISOString().slice(0, 10),
    status: normalizeStatus(s.status),
    views: s.viewsVerified ?? 0,
    earnings: s.earningsKobo ? koboToNaira(s.earningsKobo) : 0,
  };
}

export async function createSubmission(
  userId: string,
  dto: { campaignId: string; platform: string; postUrl: string; codeConfirmed: boolean },
) {
  if (!dto.codeConfirmed) {
    throw new Error("Confirm that your unique code is visible in the post caption.");
  }
  const urlError = validatePublicPostUrl(dto.postUrl, dto.platform);
  if (urlError) throw new Error(urlError);

  const participation = await prisma.campaignParticipation.findUnique({
    where: { campaignId_clipperId: { campaignId: dto.campaignId, clipperId: userId } },
    include: { campaign: true },
  });
  if (!participation) throw new Error("Join the campaign before submitting a clip.");

  if (!participation.campaign.platforms.includes(dto.platform)) {
    throw new Error(`Platform "${dto.platform}" is not allowed for this campaign.`);
  }

  try {
    const submission = await prisma.clipSubmission.create({
      data: {
        participationId: participation.id,
        campaignId: dto.campaignId,
        clipperId: userId,
        platform: dto.platform,
        postUrl: dto.postUrl.trim(),
        verificationCode: participation.verificationCode,
        codeConfirmed: dto.codeConfirmed,
        status: SubmissionStatus.pending_review,
      },
      include: { campaign: true },
    });

    await notifyUser(
      userId,
      "Clip submitted",
      `Your clip for "${submission.campaign.name}" is pending admin review.`,
      { submissionId: submission.id },
    );

    return mapMyClip(submission);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("This post URL has already been submitted.");
    }
    throw e;
  }
}

export async function listMine(userId: string) {
  const submissions = await prisma.clipSubmission.findMany({
    where: { clipperId: userId },
    include: { campaign: true },
    orderBy: { submittedAt: "desc" },
  });
  return submissions.map(mapMyClip);
}

export async function getEarningsSummary(userId: string) {
  const submissions = await prisma.clipSubmission.findMany({ where: { clipperId: userId } });
  const totalEarned = submissions
    .filter((s) => s.earningsKobo)
    .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);
  const pending = submissions
    .filter(
      (s) =>
        s.status === SubmissionStatus.approved_awaiting_views ||
        s.status === SubmissionStatus.views_verified ||
        s.status === SubmissionStatus.payout_triggered,
    )
    .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);
  const paid = submissions
    .filter((s) => s.status === SubmissionStatus.paid)
    .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);

  return {
    totalEarned: koboToNaira(totalEarned),
    pendingThisWeek: koboToNaira(pending),
    paidOut: koboToNaira(paid),
    clipsSubmitted: submissions.length,
    clipsVerified: submissions.filter(
      (s) =>
        s.status === SubmissionStatus.views_verified ||
        s.status === SubmissionStatus.payout_triggered ||
        s.status === SubmissionStatus.paid,
    ).length,
  };
}
