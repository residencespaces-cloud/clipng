import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';
import { AuditService } from '../audit/audit.service';
import { koboToNaira, nairaToKobo } from '../common/utils/money';
import { CreateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private audit: AuditService,
  ) {}

  private mapCampaign(c: {
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
      status: c.status === CampaignStatus.active ? 'Active' : c.status,
      end: c.endDate?.toISOString().slice(0, 10) ?? '',
      description: c.description,
      asset: c.assetUrl ?? '',
      image: c.imageUrl ?? '',
    };
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const profile = await this.prisma.funderProfile.findUnique({ where: { userId } });
    if (!profile) throw new BadRequestException('Funder profile required');

    const budgetKobo = nairaToKobo(dto.budget);
    const cpmKobo = nairaToKobo(dto.cpm);

    const campaign = await this.prisma.campaign.create({
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

    await this.wallet.reserveEscrowForCampaign(userId, campaign.id, campaign.name, budgetKobo);

    const active = await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: CampaignStatus.active },
      include: { funderProfile: true },
    });

    await this.audit.log({
      actorId: userId,
      action: 'campaign.launched',
      entityType: 'campaign',
      entityId: campaign.id,
      metadata: { budget: dto.budget },
    });

    return this.mapCampaign(active);
  }

  async listLive() {
    const campaigns = await this.prisma.campaign.findMany({
      where: { status: CampaignStatus.active },
      include: { funderProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return campaigns.map((c) => this.mapCampaign(c));
  }

  async listMy(userId: string) {
    const profile = await this.prisma.funderProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    const campaigns = await this.prisma.campaign.findMany({
      where: { funderProfileId: profile.id },
      include: { funderProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return campaigns.map((c) => this.mapCampaign(c));
  }

  async getById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { funderProfile: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.mapCampaign(campaign);
  }

  async joinCampaign(userId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== CampaignStatus.active) {
      throw new BadRequestException('Campaign not available');
    }

    const existing = await this.prisma.campaignParticipation.findUnique({
      where: { campaignId_clipperId: { campaignId, clipperId: userId } },
    });
    if (existing) return { verificationCode: existing.verificationCode };

    const { generateVerificationCode } = await import('../common/utils/money');
    const verificationCode = generateVerificationCode(campaignId, userId);

    const participation = await this.prisma.campaignParticipation.create({
      data: { campaignId, clipperId: userId, verificationCode },
    });

    return { verificationCode: participation.verificationCode };
  }
}
