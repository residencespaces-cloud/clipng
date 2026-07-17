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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const submission_proof_1 = require("../common/utils/submission-proof");
const money_1 = require("../common/utils/money");
let SubmissionsService = class SubmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (!dto.codeConfirmed) {
            throw new common_1.BadRequestException('Confirm that your unique code is visible in the post caption.');
        }
        const urlError = (0, submission_proof_1.validatePublicPostUrl)(dto.postUrl, dto.platform);
        if (urlError)
            throw new common_1.BadRequestException(urlError);
        const participation = await this.prisma.campaignParticipation.findUnique({
            where: { campaignId_clipperId: { campaignId: dto.campaignId, clipperId: userId } },
        });
        if (!participation) {
            throw new common_1.BadRequestException('Join the campaign before submitting a clip.');
        }
        const submission = await this.prisma.clipSubmission.create({
            data: {
                participationId: participation.id,
                campaignId: dto.campaignId,
                clipperId: userId,
                platform: dto.platform,
                postUrl: dto.postUrl.trim(),
                verificationCode: participation.verificationCode,
                codeConfirmed: dto.codeConfirmed,
                status: client_1.SubmissionStatus.pending_review,
            },
            include: {
                campaign: true,
                clipper: { include: { clipperProfile: true } },
            },
        });
        return this.mapMyClip(submission);
    }
    mapMyClip(s) {
        const statusMap = {
            pending_review: 'Pending',
            rejected: 'Rejected',
            approved_awaiting_views: 'Approved',
            views_verified: 'Verified',
            payout_triggered: 'Verified',
            paid: 'Paid',
        };
        return {
            id: s.id,
            campaign: s.campaign.name,
            platform: s.platform,
            date: s.submittedAt.toISOString().slice(0, 10),
            status: statusMap[s.status],
            views: s.viewsVerified ?? 0,
            earnings: s.earningsKobo ? (0, money_1.koboToNaira)(s.earningsKobo) : 0,
        };
    }
    async listMine(userId) {
        const submissions = await this.prisma.clipSubmission.findMany({
            where: { clipperId: userId },
            include: { campaign: true },
            orderBy: { submittedAt: 'desc' },
        });
        return submissions.map((s) => this.mapMyClip(s));
    }
    async getEarningsSummary(userId) {
        const submissions = await this.prisma.clipSubmission.findMany({
            where: { clipperId: userId },
            include: { campaign: true },
        });
        const totalEarned = submissions
            .filter((s) => s.earningsKobo)
            .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);
        const pending = submissions
            .filter((s) => s.status === client_1.SubmissionStatus.approved_awaiting_views || s.status === client_1.SubmissionStatus.views_verified)
            .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);
        const paid = submissions
            .filter((s) => s.status === client_1.SubmissionStatus.paid)
            .reduce((sum, s) => sum + (s.earningsKobo ?? 0), 0);
        return {
            totalEarned: (0, money_1.koboToNaira)(totalEarned),
            pendingThisWeek: (0, money_1.koboToNaira)(pending),
            paidOut: (0, money_1.koboToNaira)(paid),
        };
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map