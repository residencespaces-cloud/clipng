import { CampaignStatus, PayoutStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { clipperEarningsKobo, koboToNaira } from "@/server/money";
import { initiateTransfer } from "@/server/paystack";
import { normalizeStatus } from "@/server/status";
import { notifyUser } from "@/server/services/notifications.service";

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
  review?: { codeVerified: boolean } | null;
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
    status: normalizeStatus(s.status),
    codeVerified: s.review?.codeVerified ?? false,
  };
}

export async function listPending() {
  const rows = await prisma.clipSubmission.findMany({
    where: { status: SubmissionStatus.pending_review },
    include: {
      clipper: { include: { clipperProfile: true } },
      campaign: true,
      review: true,
    },
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
    approvedDate: r.review?.reviewedAt?.toISOString().slice(0, 10) ?? "",
    earningsDue: koboToNaira(r.earningsKobo ?? 0),
    payoutStatus:
      r.payoutItem?.status === PayoutStatus.paid
        ? "Paid"
        : r.payoutItem?.status === PayoutStatus.triggered
          ? "Triggered"
          : r.payoutItem?.status === PayoutStatus.failed
            ? "Failed"
            : "Pending",
  }));
}

export async function approveSubmission(adminId: string, submissionId: string, codeVerified: boolean) {
  if (!codeVerified) throw new Error("Code must be verified before approval");
  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: { clipper: true, campaign: true },
  });
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

  await notifyUser(
    submission.clipperId,
    "Clip approved",
    `Your clip for "${submission.campaign.name}" was approved. Earnings will be calculated after view verification.`,
    { submissionId },
  );

  return { success: true };
}

export async function rejectSubmission(adminId: string, submissionId: string, reason?: string) {
  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: { campaign: true },
  });
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

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: "submission.rejected",
      entityType: "clip_submission",
      entityId: submissionId,
      metadata: reason ? { reason } : undefined,
    },
  });

  await notifyUser(
    submission.clipperId,
    "Clip rejected",
    reason
      ? `Your clip for "${submission.campaign.name}" was rejected: ${reason}`
      : `Your clip for "${submission.campaign.name}" was rejected.`,
    { submissionId },
  );

  return { success: true };
}

export async function verifyViews(adminId: string, submissionId: string, viewCount: number) {
  if (!Number.isFinite(viewCount) || viewCount <= 0) {
    throw new Error("View count must be a positive number");
  }

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

  if (gross > Number(submission.campaign.remainingKobo)) {
    throw new Error(
      `Gross earnings (₦${koboToNaira(gross)}) exceed campaign remaining budget (₦${koboToNaira(submission.campaign.remainingKobo)}).`,
    );
  }

  const newRemaining = submission.campaign.remainingKobo - BigInt(gross);
  const campaignUpdate: { remainingKobo: bigint; totalViews: { increment: number }; clipCount: { increment: number }; status?: CampaignStatus } = {
    remainingKobo: newRemaining,
    totalViews: { increment: viewCount },
    clipCount: { increment: 1 },
  };
  if (newRemaining <= BigInt(0)) {
    campaignUpdate.status = CampaignStatus.exhausted;
  }

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
      data: campaignUpdate,
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

  await notifyUser(
    submission.clipperId,
    "Views verified — earnings calculated",
    `Your clip for "${submission.campaign.name}" earned ₦${koboToNaira(clipper).toLocaleString()} based on ${viewCount.toLocaleString()} views.`,
    { submissionId, viewCount, earnings: clipper },
  );

  return { success: true, earnings: koboToNaira(clipper) };
}

export async function triggerPayout(adminId: string, submissionId: string) {
  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: {
      payoutItem: true,
      clipper: { include: { clipperProfile: true } },
      campaign: true,
    },
  });
  if (!submission || submission.status !== SubmissionStatus.views_verified || !submission.payoutItem) {
    throw new Error("Submission not ready for payout");
  }

  const recipientCode = submission.clipper.clipperProfile?.paystackRecipientCode;
  if (!recipientCode) {
    throw new Error("Clipper has no Paystack recipient. They must update bank details.");
  }

  const reference = `payout_${submission.payoutItem.id}_${Date.now()}`;
  let paystackRef = reference;

  if (process.env.PAYSTACK_SECRET_KEY) {
    const transfer = await initiateTransfer({
      amountKobo: submission.payoutItem.amountKobo,
      recipientCode,
      reference,
      reason: `ClipNG payout — ${submission.campaign.name}`,
    });
    paystackRef = transfer.reference;
  }

  await prisma.$transaction([
    prisma.payoutItem.update({
      where: { id: submission.payoutItem.id },
      data: { status: PayoutStatus.triggered, paystackRef },
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
      metadata: { reference: paystackRef },
    },
  });

  await notifyUser(
    submission.clipperId,
    "Payout triggered",
    `Your payout of ₦${koboToNaira(submission.payoutItem.amountKobo).toLocaleString()} for "${submission.campaign.name}" has been initiated.`,
    { submissionId, reference: paystackRef },
  );

  return { success: true, status: "Triggered", reference: paystackRef };
}

export async function handleTransferSuccess(reference: string) {
  const item = await prisma.payoutItem.findFirst({
    where: { paystackRef: reference },
    include: { submission: { include: { campaign: true } } },
  });
  if (!item || item.status === PayoutStatus.paid) return;

  await prisma.$transaction([
    prisma.payoutItem.update({
      where: { id: item.id },
      data: { status: PayoutStatus.paid },
    }),
    prisma.clipSubmission.update({
      where: { id: item.submissionId },
      data: { status: SubmissionStatus.paid },
    }),
  ]);

  await notifyUser(
    item.clipperId,
    "Payout completed",
    `Your payout of ₦${koboToNaira(item.amountKobo).toLocaleString()} for "${item.submission.campaign.name}" has been paid.`,
    { payoutItemId: item.id },
  );
}

export async function handleTransferFailed(reference: string, reason?: string) {
  const item = await prisma.payoutItem.findFirst({ where: { paystackRef: reference } });
  if (!item || item.status === PayoutStatus.failed) return;

  await prisma.payoutItem.update({
    where: { id: item.id },
    data: { status: PayoutStatus.failed, failureReason: reason ?? "Transfer failed" },
  });

  await notifyUser(
    item.clipperId,
    "Payout failed",
    `Your payout could not be completed. Our team will retry. Reason: ${reason ?? "Unknown"}`,
    { payoutItemId: item.id },
  );
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
    status: normalizeStatus(c.status),
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
    status: normalizeStatus(p.status),
    paystackRef: p.paystackRef,
    failureReason: p.failureReason,
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
    createdAt: l.createdAt.toISOString(),
    metadata: l.metadata,
  }));
}
