import { CampaignStatus, PayoutStatus, Prisma, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, viewUpdateEarningsKobo } from "@/server/money";
import { initiateTransfer } from "@/server/paystack";
import { normalizeStatus } from "@/server/status";
import { notifyEmail } from "@/server/services/notifications.service";
import * as Email from "@/server/emails/templates";

/** Submissions that have cleared review and can still accrue views. */
const TRACKED_STATUSES: SubmissionStatus[] = [
  SubmissionStatus.approved_awaiting_views,
  SubmissionStatus.views_verified,
  SubmissionStatus.payout_triggered,
  SubmissionStatus.paid,
];

/** Campaign states that may still spend budget on new views. */
const ACCRUING_CAMPAIGN_STATUSES: CampaignStatus[] = [
  CampaignStatus.active,
  CampaignStatus.paused,
];

const PAYABLE_STATUSES: PayoutStatus[] = [PayoutStatus.pending, PayoutStatus.failed];

const sumKobo = <T>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

/**
 * A submission can hold many payout items once views keep climbing, so its
 * status is derived from the items rather than set directly.
 */
async function resolveSubmissionStatus(
  tx: Prisma.TransactionClient,
  submissionId: string,
  fallback: SubmissionStatus,
): Promise<SubmissionStatus> {
  const items = await tx.payoutItem.findMany({
    where: { submissionId },
    select: { status: true },
  });
  if (items.length === 0) return fallback;
  if (items.some((i) => PAYABLE_STATUSES.includes(i.status))) return SubmissionStatus.views_verified;
  if (items.some((i) => i.status === PayoutStatus.triggered)) return SubmissionStatus.payout_triggered;
  return SubmissionStatus.paid;
}

function mapPendingRow(s: {
  id: string;
  platform: string;
  postUrl: string;
  verificationCode: string;
  submittedAt: Date;
  viewsVerified: number | null;
  status: SubmissionStatus;
  clipper: { clipperProfile: { displayName: string } | null };
  campaign: {
    name: string;
    description?: string;
    requiredCaption?: string | null;
    minClipSeconds?: number | null;
    maxClipSeconds?: number | null;
    maxClipsPerClipper?: number | null;
    rulesDo?: string[];
    rulesDont?: string[];
    rulesNotes?: string | null;
  };
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
    campaignBrief: s.campaign.description ?? "",
    campaignRules: {
      requiredCaption: s.campaign.requiredCaption ?? "",
      minClipSeconds: s.campaign.minClipSeconds ?? null,
      maxClipSeconds: s.campaign.maxClipSeconds ?? null,
      maxClipsPerClipper: s.campaign.maxClipsPerClipper ?? null,
      rulesDo: s.campaign.rulesDo ?? [],
      rulesDont: s.campaign.rulesDont ?? [],
      rulesNotes: s.campaign.rulesNotes ?? "",
    },
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

export async function listTrackedClips() {
  const rows = await prisma.clipSubmission.findMany({
    where: { status: { in: TRACKED_STATUSES } },
    include: {
      clipper: { include: { clipperProfile: true } },
      campaign: true,
      review: true,
      payoutItems: true,
      viewVerifications: { orderBy: { verifiedAt: "desc" }, take: 1 },
      _count: { select: { viewVerifications: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return rows.map((r) => {
    const paidKobo = sumKobo(
      r.payoutItems.filter((i) => i.status === PayoutStatus.paid),
      (i) => i.amountKobo,
    );
    const outstandingKobo = sumKobo(
      r.payoutItems.filter((i) => i.status !== PayoutStatus.paid),
      (i) => i.amountKobo,
    );
    const campaignRemaining = Number(r.campaign.remainingKobo);
    const lastUpdate = r.viewVerifications[0];

    return {
      ...mapPendingRow(r),
      approvedDate: r.review?.reviewedAt.toISOString().slice(0, 10) ?? "",
      viewsVerified: r.viewsVerified ?? 0,
      viewCount: r.viewsVerified ? String(r.viewsVerified) : "",
      earningsAccrued: koboToNaira(r.earningsKobo ?? 0),
      paidOut: koboToNaira(paidKobo),
      outstanding: koboToNaira(outstandingKobo),
      updateCount: r._count.viewVerifications,
      lastUpdated: lastUpdate?.verifiedAt.toISOString().slice(0, 10) ?? "",
      cpm: koboToNaira(r.campaign.cpmKobo),
      campaignStatus: normalizeStatus(r.campaign.status),
      campaignRemaining: koboToNaira(campaignRemaining),
      trackingOpen:
        ACCRUING_CAMPAIGN_STATUSES.includes(r.campaign.status) && campaignRemaining > 0,
    };
  });
}

export async function listReadyForPayout() {
  const items = await prisma.payoutItem.findMany({
    where: { status: { in: PAYABLE_STATUSES } },
    include: {
      submission: {
        include: {
          campaign: true,
          review: true,
          clipper: { include: { clipperProfile: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return items.map((i) => ({
    id: i.id,
    submissionId: i.submissionId,
    clipper: i.submission.clipper.clipperProfile?.displayName ?? "Unknown",
    campaign: i.submission.campaign.name,
    platform: i.submission.platform,
    link: i.submission.postUrl,
    verificationCode: i.submission.verificationCode,
    date: i.createdAt.toISOString().slice(0, 10),
    views: i.submission.viewsVerified ?? 0,
    viewsVerified: i.submission.viewsVerified ?? 0,
    status: normalizeStatus(i.submission.status),
    approvedDate: i.submission.review?.reviewedAt.toISOString().slice(0, 10) ?? "",
    earningsDue: koboToNaira(i.amountKobo),
    payoutStatus: normalizeStatus(i.status),
    failureReason: i.failureReason,
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

  await notifyEmail(
    submission.clipperId,
    Email.clipApproved(submission.campaign.name),
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

  await notifyEmail(
    submission.clipperId,
    Email.clipRejected(submission.campaign.name, reason),
    { submissionId },
  );

  return { success: true };
}

/**
 * Records a new cumulative view total for an approved clip. Each call credits
 * only the views gained since the last update and queues a payout for the
 * incremental earnings, so a clip can be paid repeatedly while its campaign
 * still has budget.
 */
export async function updateVerifiedViews(
  adminId: string,
  submissionId: string,
  observedViews: number,
) {
  if (!Number.isFinite(observedViews) || observedViews <= 0) {
    throw new Error("View count must be a positive number");
  }
  const totalObserved = Math.floor(observedViews);

  const submission = await prisma.clipSubmission.findUnique({
    where: { id: submissionId },
    include: { campaign: true, earningEntries: true },
  });
  if (!submission) throw new Error("Submission not found");
  if (!TRACKED_STATUSES.includes(submission.status)) {
    throw new Error("Submission must be approved before views can be tracked");
  }

  const { campaign } = submission;
  if (!ACCRUING_CAMPAIGN_STATUSES.includes(campaign.status)) {
    throw new Error(
      `Campaign is ${normalizeStatus(campaign.status).toLowerCase()} — views can no longer be credited.`,
    );
  }

  const previousViews = submission.viewsVerified ?? 0;
  if (totalObserved <= previousViews) {
    throw new Error(
      `Enter the latest total views. ${previousViews.toLocaleString()} views are already credited for this clip.`,
    );
  }

  const remainingKobo = Number(campaign.remainingKobo);
  if (remainingKobo <= 0) {
    throw new Error("Campaign budget is exhausted — no further views can be credited.");
  }

  const accruedGrossKobo = sumKobo(submission.earningEntries, (e) => e.grossKobo);
  const accruedClipperKobo = sumKobo(submission.earningEntries, (e) => e.clipperKobo);

  const update = viewUpdateEarningsKobo({
    previousViews,
    observedViews: totalObserved,
    accruedGrossKobo,
    accruedClipperKobo,
    cpmKobo: campaign.cpmKobo,
    remainingKobo,
    platformFeePercent: Number(process.env.PLATFORM_FEE_PERCENT ?? 20),
  });

  if (update.creditedViews <= 0) {
    throw new Error(
      `Campaign has only ₦${koboToNaira(remainingKobo).toLocaleString()} left — not enough to credit more views.`,
    );
  }

  const isFirstCredit = previousViews === 0;
  const newRemaining = campaign.remainingKobo - BigInt(update.deltaGrossKobo);
  const clampedRemaining = newRemaining > BigInt(0) ? newRemaining : BigInt(0);

  await prisma.$transaction(async (tx) => {
    await tx.viewVerification.create({
      data: {
        submissionId,
        verifierId: adminId,
        viewCount: update.totalViews,
        previousViews,
        observedViews: totalObserved,
        deltaViews: update.creditedViews,
        grossKobo: update.deltaGrossKobo,
        clipperKobo: update.deltaClipperKobo,
        platformKobo: update.deltaPlatformKobo,
        cappedByBudget: update.cappedByBudget,
      },
    });

    if (update.deltaGrossKobo > 0) {
      await tx.earningEntry.create({
        data: {
          submissionId,
          clipperId: submission.clipperId,
          campaignId: submission.campaignId,
          grossKobo: update.deltaGrossKobo,
          clipperKobo: update.deltaClipperKobo,
          platformKobo: update.deltaPlatformKobo,
        },
      });
    }

    if (update.deltaClipperKobo > 0) {
      await tx.payoutItem.create({
        data: {
          submissionId,
          clipperId: submission.clipperId,
          amountKobo: update.deltaClipperKobo,
          status: PayoutStatus.pending,
        },
      });
    }

    await tx.campaign.update({
      where: { id: submission.campaignId },
      data: {
        remainingKobo: clampedRemaining,
        totalViews: { increment: update.creditedViews },
        ...(isFirstCredit ? { clipCount: { increment: 1 } } : {}),
        ...(clampedRemaining === BigInt(0) ? { status: CampaignStatus.exhausted } : {}),
      },
    });

    await tx.clipSubmission.update({
      where: { id: submissionId },
      data: {
        viewsVerified: update.totalViews,
        earningsKobo: accruedClipperKobo + update.deltaClipperKobo,
        status: await resolveSubmissionStatus(tx, submissionId, SubmissionStatus.views_verified),
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: "submission.views_updated",
      entityType: "clip_submission",
      entityId: submissionId,
      metadata: {
        previousViews,
        observedViews: totalObserved,
        creditedViews: update.creditedViews,
        totalViews: update.totalViews,
        clipperKobo: update.deltaClipperKobo,
        cappedByBudget: update.cappedByBudget,
      },
    },
  });

  await notifyEmail(
    submission.clipperId,
    Email.viewsCredited({
      campaignName: campaign.name,
      creditedViews: update.creditedViews,
      totalViews: update.totalViews,
      earningsNaira: koboToNaira(update.deltaClipperKobo),
      isFirst: isFirstCredit,
    }),
    {
      submissionId,
      creditedViews: update.creditedViews,
      totalViews: update.totalViews,
      earnings: update.deltaClipperKobo,
    },
  );

  // Alert funder when budget is low or just exhausted
  const funderUserId = (
    await prisma.funderProfile.findUnique({
      where: { id: campaign.funderProfileId },
      select: { userId: true },
    })
  )?.userId;

  if (funderUserId) {
    const remainingAfter = Number(clampedRemaining);
    const remainingBefore = Number(campaign.remainingKobo);
    const budgetTotal = Number(campaign.budgetKobo);
    if (remainingAfter <= 0 && remainingBefore > 0) {
      await notifyEmail(funderUserId, Email.campaignExhausted(campaign.name), {
        campaignId: campaign.id,
      });
    } else if (budgetTotal > 0) {
      const percentAfter = (remainingAfter / budgetTotal) * 100;
      const percentBefore = (remainingBefore / budgetTotal) * 100;
      if (percentAfter <= 20 && percentBefore > 20) {
        await notifyEmail(
          funderUserId,
          Email.campaignBudgetLow(
            campaign.name,
            koboToNaira(remainingAfter),
            Math.round(percentAfter),
          ),
          { campaignId: campaign.id, percentLeft: Math.round(percentAfter) },
        );
      }
    }
  }

  return {
    success: true,
    creditedViews: update.creditedViews,
    totalViews: update.totalViews,
    uncreditedViews: update.uncreditedViews,
    cappedByBudget: update.cappedByBudget,
    earnings: koboToNaira(update.deltaClipperKobo),
  };
}

export async function triggerPayout(adminId: string, payoutItemId: string) {
  const item = await prisma.payoutItem.findUnique({
    where: { id: payoutItemId },
    include: {
      submission: {
        include: {
          campaign: true,
          clipper: { include: { clipperProfile: true } },
        },
      },
    },
  });
  if (!item) throw new Error("Payout not found");
  if (!PAYABLE_STATUSES.includes(item.status)) {
    throw new Error(`Payout already ${normalizeStatus(item.status).toLowerCase()}`);
  }
  if (item.amountKobo <= 0) throw new Error("Payout amount is zero");

  const recipientCode = item.submission.clipper.clipperProfile?.paystackRecipientCode;
  if (!recipientCode) {
    throw new Error("Clipper has no Paystack recipient. They must update bank details.");
  }

  const reference = `payout_${item.id}_${Date.now()}`;
  let paystackRef = reference;

  if (process.env.PAYSTACK_SECRET_KEY) {
    const transfer = await initiateTransfer({
      amountKobo: item.amountKobo,
      recipientCode,
      reference,
      reason: `KudiClip payout — ${item.submission.campaign.name}`,
    });
    paystackRef = transfer.reference;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payoutItem.update({
      where: { id: item.id },
      data: { status: PayoutStatus.triggered, paystackRef, failureReason: null },
    });
    await tx.clipSubmission.update({
      where: { id: item.submissionId },
      data: {
        status: await resolveSubmissionStatus(
          tx,
          item.submissionId,
          SubmissionStatus.payout_triggered,
        ),
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: "payout.triggered",
      entityType: "payout_item",
      entityId: item.id,
      metadata: { reference: paystackRef, submissionId: item.submissionId },
    },
  });

  await notifyEmail(
    item.clipperId,
    Email.payoutTriggered(item.submission.campaign.name, koboToNaira(item.amountKobo)),
    { payoutItemId: item.id, submissionId: item.submissionId, reference: paystackRef },
  );

  return { success: true, status: "Triggered", reference: paystackRef };
}

export async function handleTransferSuccess(reference: string) {
  const item = await prisma.payoutItem.findFirst({
    where: { paystackRef: reference },
    include: { submission: { include: { campaign: true } } },
  });
  if (!item || item.status === PayoutStatus.paid) return;

  await prisma.$transaction(async (tx) => {
    await tx.payoutItem.update({
      where: { id: item.id },
      data: { status: PayoutStatus.paid },
    });
    await tx.clipSubmission.update({
      where: { id: item.submissionId },
      data: {
        status: await resolveSubmissionStatus(tx, item.submissionId, SubmissionStatus.paid),
      },
    });
  });

  await notifyEmail(
    item.clipperId,
    Email.payoutCompleted(item.submission.campaign.name, koboToNaira(item.amountKobo)),
    { payoutItemId: item.id },
  );
}

export async function handleTransferFailed(reference: string, reason?: string) {
  const item = await prisma.payoutItem.findFirst({ where: { paystackRef: reference } });
  if (!item || item.status === PayoutStatus.failed) return;

  await prisma.$transaction(async (tx) => {
    await tx.payoutItem.update({
      where: { id: item.id },
      data: { status: PayoutStatus.failed, failureReason: reason ?? "Transfer failed" },
    });
    await tx.clipSubmission.update({
      where: { id: item.submissionId },
      data: {
        status: await resolveSubmissionStatus(
          tx,
          item.submissionId,
          SubmissionStatus.views_verified,
        ),
      },
    });
  });

  await notifyEmail(item.clipperId, Email.payoutFailed(reason), { payoutItemId: item.id });
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
