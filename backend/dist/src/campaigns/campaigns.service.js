"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const wallet_service_1 = require("../wallets/wallet.service");
const audit_service_1 = require("../audit/audit.service");
const money_1 = require("../common/utils/money");
let CampaignsService = class CampaignsService {
    constructor(prisma, wallet, audit) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.audit = audit;
    }
    mapCampaign(c) {
        return {
            id: c.id,
            name: c.name,
            funder: c.funderProfile.businessName,
            cpm: (0, money_1.koboToNaira)(c.cpmKobo),
            budget: (0, money_1.koboToNaira)(c.budgetKobo),
            remaining: (0, money_1.koboToNaira)(c.remainingKobo),
            views: c.totalViews,
            clips: c.clipCount,
            platforms: c.platforms,
            status: c.status === client_1.CampaignStatus.active ? 'Active' : c.status,
            end: c.endDate?.toISOString().slice(0, 10) ?? '',
            description: c.description,
            asset: c.assetUrl ?? '',
            image: c.imageUrl ?? '',
        };
    }
    async create(userId, dto) {
        const profile = await this.prisma.funderProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new common_1.BadRequestException('Funder profile required');
        const budgetKobo = (0, money_1.nairaToKobo)(dto.budget);
        const cpmKobo = (0, money_1.nairaToKobo)(dto.cpm);
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
                status: client_1.CampaignStatus.draft,
                startDate: dto.start ? new Date(dto.start) : undefined,
                endDate: dto.end ? new Date(dto.end) : undefined,
            },
            include: { funderProfile: true },
        });
        await this.wallet.reserveEscrowForCampaign(userId, campaign.id, campaign.name, budgetKobo);
        const active = await this.prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: client_1.CampaignStatus.active },
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
            where: { status: client_1.CampaignStatus.active },
            include: { funderProfile: true },
            orderBy: { createdAt: 'desc' },
        });
        return campaigns.map((c) => this.mapCampaign(c));
    }
    async listMy(userId) {
        const profile = await this.prisma.funderProfile.findUnique({ where: { userId } });
        if (!profile)
            return [];
        const campaigns = await this.prisma.campaign.findMany({
            where: { funderProfileId: profile.id },
            include: { funderProfile: true },
            orderBy: { createdAt: 'desc' },
        });
        return campaigns.map((c) => this.mapCampaign(c));
    }
    async getById(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: { funderProfile: true },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.mapCampaign(campaign);
    }
    async joinCampaign(userId, campaignId) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign || campaign.status !== client_1.CampaignStatus.active) {
            throw new common_1.BadRequestException('Campaign not available');
        }
        const existing = await this.prisma.campaignParticipation.findUnique({
            where: { campaignId_clipperId: { campaignId, clipperId: userId } },
        });
        if (existing)
            return { verificationCode: existing.verificationCode };
        const { generateVerificationCode } = await Promise.resolve().then(() => require('../common/utils/money'));
        const verificationCode = generateVerificationCode(campaignId, userId);
        const participation = await this.prisma.campaignParticipation.create({
            data: { campaignId, clipperId: userId, verificationCode },
        });
        return { verificationCode: participation.verificationCode };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        audit_service_1.AuditService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map