import { CampaignStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, nairaToKobo, generateVerificationCode } from "@/server/money";
import { normalizeStatus } from "@/server/status";
import { isValidImageRef } from "@/server/uploads";
import { isValidUrl } from "@/server/validation";
import { notifyEmail, notifyClippersNewCampaign } from "@/server/services/notifications.service";
import * as Email from "@/server/emails/templates";
import { reserveEscrowForCampaign } from "./wallet.service";

function mapCampaign(c: {
  id: string;
  name: string;
  cpmKobo: number;
  budgetKobo: bigint;
  remainingKobo: bigint;
  totalViews: number;
  clipCount: number;
  platforms: string[];
  status: CampaignStatus;
  endDate: Date | null;
  description: string;
  assetUrl: string | null;
  imageUrl: string | null;
  funderProfile: { businessName: string };
}) {
  return {
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
    description: c.description,
    asset: c.assetUrl ?? "",
    image: c.imageUrl ?? "",
  };
}

export async function createCampaign(
  userId: string,
  dto: {
    name: string;
    sourceType: "video" | "vod";
    assetUrl?: string;
    bestMoments?: string;
    description: string;
    platforms: string[];
    cpm: number;
    budget: number;
    start?: string;
    end?: string;
    imageUrl: string;
  },
) {
  const profile = await prisma.funderProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Funder profile required");

  if (!dto.name?.trim()) throw new Error("Campaign name is required");
  if (!dto.description?.trim()) throw new Error("Campaign description is required");
  if (!dto.platforms?.length) throw new Error("Select at least one platform");
  if (dto.cpm <= 0) throw new Error("CPM must be greater than zero");
  if (dto.budget <= 0) throw new Error("Budget must be greater than zero");
  if (!dto.imageUrl?.trim()) throw new Error("Campaign thumbnail is required");
  if (!isValidImageRef(dto.imageUrl)) throw new Error("Campaign thumbnail is invalid");
  if (dto.assetUrl && !isValidUrl(dto.assetUrl)) throw new Error("Asset URL is invalid");
  if (dto.start && dto.end && new Date(dto.end) <= new Date(dto.start)) {
    throw new Error("End date must be after start date");
  }

  const budgetKobo = nairaToKobo(dto.budget);
  const cpmKobo = nairaToKobo(dto.cpm);

  const campaign = await prisma.campaign.create({
    data: {
      funderProfileId: profile.id,
      name: dto.name,
      sourceType: dto.sourceType,
      assetUrl: dto.assetUrl,
      bestMoments: dto.bestMoments,
      description: dto.description,
      platforms: dto.platforms,
      cpmKobo,
      budgetKobo: BigInt(budgetKobo),
      remainingKobo: BigInt(budgetKobo),
      imageUrl: dto.imageUrl,
      status: CampaignStatus.draft,
      startDate: dto.start ? new Date(dto.start) : undefined,
      endDate: dto.end ? new Date(dto.end) : undefined,
    },
    include: { funderProfile: true },
  });

  await reserveEscrowForCampaign(userId, campaign.id, campaign.name, budgetKobo);

  const active = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: CampaignStatus.active },
    include: { funderProfile: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "campaign.launched",
      entityType: "campaign",
      entityId: campaign.id,
      metadata: { budget: dto.budget } as Prisma.InputJsonValue,
    },
  });

  await notifyEmail(
    userId,
    Email.campaignLaunched(active.name, dto.budget),
    { campaignId: active.id },
  );

  void notifyClippersNewCampaign(active.name, koboToNaira(active.cpmKobo), active.id);

  return mapCampaign(active);
}

export async function listLive() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: CampaignStatus.active },
    include: { funderProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return campaigns.map(mapCampaign);
}

export async function listMy(userId: string) {
  const profile = await prisma.funderProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  const campaigns = await prisma.campaign.findMany({
    where: { funderProfileId: profile.id },
    include: { funderProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return campaigns.map(mapCampaign);
}

export async function getById(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { funderProfile: true },
  });
  if (!campaign) throw new Error("Campaign not found");
  return mapCampaign(campaign);
}

export async function joinCampaign(userId: string, campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== CampaignStatus.active) {
    throw new Error("Campaign not available");
  }

  const existing = await prisma.campaignParticipation.findUnique({
    where: { campaignId_clipperId: { campaignId, clipperId: userId } },
  });
  if (existing) return { verificationCode: existing.verificationCode };

  const verificationCode = generateVerificationCode(campaignId, userId);
  const participation = await prisma.campaignParticipation.create({
    data: { campaignId, clipperId: userId, verificationCode },
  });
  return { verificationCode: participation.verificationCode };
}

export async function extendCampaignBudget(userId: string, campaignId: string, amountNaira: number) {
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const profile = await prisma.funderProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Funder profile required");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { funderProfile: true },
  });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.funderProfileId !== profile.id) {
    throw new Error("You can only extend your own campaigns");
  }
  if (campaign.status !== CampaignStatus.exhausted) {
    throw new Error("Only exhausted campaigns can be extended");
  }
  if (campaign.endDate && campaign.endDate < new Date()) {
    throw new Error("Campaign has ended — extend the end date before adding budget");
  }

  const amountKobo = nairaToKobo(amountNaira);
  const extensionRef = `escrow_${campaignId}_ext_${Date.now()}`;

  await reserveEscrowForCampaign(
    userId,
    campaignId,
    `${campaign.name} (budget extension)`,
    amountKobo,
    extensionRef,
  );

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      budgetKobo: { increment: BigInt(amountKobo) },
      remainingKobo: { increment: BigInt(amountKobo) },
      status: CampaignStatus.active,
    },
    include: { funderProfile: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "campaign.budget_extended",
      entityType: "campaign",
      entityId: campaignId,
      metadata: { amount: amountNaira } as Prisma.InputJsonValue,
    },
  });

  await notifyEmail(
    userId,
    Email.campaignBudgetExtended(campaign.name, amountNaira),
    { campaignId, amount: amountNaira },
  );

  return mapCampaign(updated);
}
