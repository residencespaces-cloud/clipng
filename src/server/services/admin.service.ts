import { PayoutStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { clipperEarningsKobo, koboToNaira } from "@/server/money";

function mapPendingRow(s: {
  id: string;
  platform: string;
  postUrl: string;
  verificationCode: string;
  submittedAt: Date;
  viewsVerified: number | null;
  status: SubmissionStatus;
  clipper: { clipperProfile: { displayName: string } | null };
  campaign: { name: string };
}) {
  return {
    id: s.id,
    clipper: s.clipper.clipperProfile?.displayName ?? "Unknown",
    campaign: s.campaign.name,
    platform: s.platform,
    link: s.postUrl,
    verificationCode: s.verificationCode,
    date: s.submittedAt.toISOString().slice(0, 10),
    views: s.viewsVerified ?? 0,
    status: s.status,
  };
}

export async function listPending() {
  const rows = await prisma.clipSubmission.findMany({
    where: { status: SubmissionStatus.pending_review },
    include: { clipper: { include: { clipperProfile: true } }, campaign: true },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(mapPendingRow);
}

export async function listAwaitingViews() {
  const rows = await prisma.clipSubmission.findMany({
    where: { status: SubmissionStatus.approved_awaiting_views },
    include: {
      clipper: { include: { clipperProfile: true } },
      campaign: true,
      review: true,
    },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map((r) => ({
    ...mapPendingRow(r),
    approvedDate: r.review?.reviewedAt.toISOString().slice(0, 10) ?? "",
    viewCount: "",
  }));
}

export async function listReadyForPayout() {
  const rows = await prisma.clipSubmission.findMany({
    where: { status: SubmissionStatus.views_verified },
    include: {
      clipper: { include: { clipperProfile: true } },
      campaign: true,
      payoutItem: true,
      review: true,
    },
    orderBy: { submittedAt: "desc" },
  });
  return rows.map((r) => ({
    ...mapPendingRow(r),
    viewsVerified: r.viewsVerified ?? 0,
    approvedDate: r.review?.reviewedAt.toISOString().slice(0, 10) ?? "",
    earningsDue: koboToNaira(r.earningsKobo ?? 0),
    payoutStatus:
      r.payoutItem?.status === PayoutStatus.paid
        ? "Paid"
        : r.payoutItem?.status === PayoutStatus.triggered
          ? "Triggered"
          : "Pending",
  }));
}

export async function approveSubmission(adminId: string, submissionId: string, codeVerified: boolean) {
  if (!codeVerified) throw new Error("Code must be verified before approval");
  const submission = await prisma.clipSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.status !== SubmissionStatus.pending_review) {
    throw new Error("Submission not in pending review");
  }

  await prisma.$transaction([
    prisma.submissionReview.create({
      data: {
        submissionId,
        reviewerId: adminId,
        codeVerified: true,
        approved: true,
      },
    }),
    prisma.clipSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.approved_awaiting_views },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: "submission.approved",
      entityType: "clip_submission",
      entityId: submissionId,
    },
  });

  return { success: true };
}

export async function rejectSubmission(adminId: string, submissionId: string, reason?: string) {
  const submission = await prisma.clipSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.status !== SubmissionStatus.pending_review) {
    throw new Error("Submission not in pending review");
  }

  await prisma.$transaction([
    prisma.submissionReview.create({
      data: {
        submissionId,
        reviewerId: adminId,
        codeVerified: false,
        approved: false,
        rejectionReason: reason,
      },
    }),
    prisma.clipSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.rejected },
    }),
  ]);

  return { success: true };
}

export async function verifyViews(adminId: string, submissionId: string, viewCount: number) {
  if (viewCount <= 0) throw new Error("View count must be positive");
  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: { campaign: true },
  });
  if (!submission || submission.status !== SubmissionStatus.approved_awaiting_views) {
    throw new Error("Submission not awaiting view verification");
  }

  const platformFee = Number(process.env.PLATFORM_FEE_PERCENT ?? 20);
  const { gross, clipper, platform } = clipperEarningsKobo(
    viewCount,
    submission.campaign.cpmKobo,
    platformFee,
  );

  await prisma.$transaction(async (tx) => {
    await tx.viewVerification.create({
      data: { submissionId, verifierId: adminId, viewCount },
    });
    await tx.earningEntry.create({
      data: {
        submissionId,
        clipperId: submission.clipperId,
        campaignId: submission.campaignId,
        grossKobo: gross,
        clipperKobo: clipper,
        platformKobo: platform,
      },
    });
    await tx.clipSubmission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.views_verified,
        viewsVerified: viewCount,
        earningsKobo: clipper,
      },
    });
    await tx.campaign.update({
      where: { id: submission.campaignId },
      data: {
        totalViews: { increment: viewCount },
        clipCount: { increment: 1 },
        remainingKobo: { decrement: BigInt(gross) },
      },
    });
    await tx.payoutItem.create({
      data: {
        submissionId,
        clipperId: submission.clipperId,
        amountKobo: clipper,
        status: PayoutStatus.pending,
      },
    });
  });

  return { success: true, earnings: koboToNaira(clipper) };
}

export async function triggerPayout(adminId: string, submissionId: string) {
  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: { payoutItem: true },
  });
  if (!submission || submission.status !== SubmissionStatus.views_verified || !submission.payoutItem) {
    throw new Error("Submission not ready for payout");
  }

  await prisma.$transaction([
    prisma.payoutItem.update({
      where: { id: submission.payoutItem.id },
      data: { status: PayoutStatus.triggered, paystackRef: `demo_${Date.now()}` },
    }),
    prisma.clipSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.payout_triggered },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: "payout.triggered",
      entityType: "clip_submission",
      entityId: submissionId,
    },
  });

  return { success: true, status: "Triggered" };
}

export async function listAllCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    include: { funderProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    funder: c.funderProfile.businessName,
    cpm: koboToNaira(c.cpmKobo),
    budget: koboToNaira(c.budgetKobo),
    remaining: koboToNaira(c.remainingKobo),
    views: c.totalViews,
    clips: c.clipCount,
    platforms: c.platforms,
    status: c.status,
    end: c.endDate?.toISOString().slice(0, 10) ?? "",
  }));
}

export async function listPayouts() {
  const items = await prisma.payoutItem.findMany({
    include: {
      submission: {
        include: {
          campaign: true,
          clipper: { include: { clipperProfile: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return items.map((p) => ({
    id: p.id,
    date: p.createdAt.toISOString().slice(0, 10),
    clipper: p.submission.clipper.clipperProfile?.displayName ?? "Unknown",
    campaign: p.submission.campaign.name,
    amount: koboToNaira(p.amountKobo),
    status:
      p.status === PayoutStatus.paid
        ? "Paid"
        : p.status === PayoutStatus.triggered
          ? "Triggered"
          : "Pending",
  }));
}

export async function listAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });
  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    actor: l.actor?.email ?? "system",
    createdAt: l.createdAt,
    metadata: l.metadata,
  }));
}
