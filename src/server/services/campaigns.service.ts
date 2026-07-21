import { CampaignStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";
import { koboToNaira, nairaToKobo, generateVerificationCode } from "@/server/money";
import { normalizeStatus } from "@/server/status";
import { isValidUrl } from "@/server/validation";
import { notifyUser } from "@/server/services/notifications.service";
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
    imageUrl?: string;
  },
) {
  const profile = await prisma.funderProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Funder profile required");

  if (!dto.name?.trim()) throw new Error("Campaign name is required");
  if (!dto.description?.trim()) throw new Error("Campaign description is required");
  if (!dto.platforms?.length) throw new Error("Select at least one platform");
  if (dto.cpm <= 0) throw new Error("CPM must be greater than zero");
  if (dto.budget <= 0) throw new Error("Budget must be greater than zero");
  if (dto.assetUrl && !isValidUrl(dto.assetUrl)) throw new Error("Asset URL is invalid");
  if (dto.imageUrl && !isValidUrl(dto.imageUrl)) throw new Error("Image URL is invalid");
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

  await notifyUser(
    userId,
    "Campaign launched",
    `Your campaign "${active.name}" is now live with a budget of ₦${dto.budget.toLocaleString()}.`,
    { campaignId: active.id },
  );

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
