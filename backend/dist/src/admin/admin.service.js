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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const money_1 = require("../common/utils/money");
let AdminService = class AdminService {
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
    }
    mapPendingRow(s) {
        return {
            id: s.id,
            clipper: s.clipper.clipperProfile?.displayName ?? 'Unknown',
            campaign: s.campaign.name,
            platform: s.platform,
            link: s.postUrl,
            verificationCode: s.verificationCode,
            date: s.submittedAt.toISOString().slice(0, 10),
            views: s.viewsVerified ?? 0,
            status: s.status,
        };
    }
    async listPending() {
        const rows = await this.prisma.clipSubmission.findMany({
            where: { status: client_1.SubmissionStatus.pending_review },
            include: { clipper: { include: { clipperProfile: true } }, campaign: true },
            orderBy: { submittedAt: 'desc' },
        });
        return rows.map((r) => this.mapPendingRow(r));
    }
    async listAwaitingViews() {
        const rows = await this.prisma.clipSubmission.findMany({
            where: { status: client_1.SubmissionStatus.approved_awaiting_views },
            include: { clipper: { include: { clipperProfile: true } }, campaign: true, review: true },
            orderBy: { submittedAt: 'desc' },
        });
        return rows.map((r) => ({
            ...this.mapPendingRow(r),
            approvedDate: r.review?.reviewedAt.toISOString().slice(0, 10) ?? '',
            viewCount: '',
        }));
    }
    async listReadyForPayout() {
        const rows = await this.prisma.clipSubmission.findMany({
            where: { status: client_1.SubmissionStatus.views_verified },
            include: {
                clipper: { include: { clipperProfile: true } },
                campaign: true,
                payoutItem: true,
                review: true,
            },
            orderBy: { submittedAt: 'desc' },
        });
        return rows.map((r) => ({
            ...this.mapPendingRow(r),
            viewsVerified: r.viewsVerified ?? 0,
            approvedDate: r.review?.reviewedAt.toISOString().slice(0, 10) ?? '',
            earningsDue: (0, money_1.koboToNaira)(r.earningsKobo ?? 0),
            payoutStatus: r.payoutItem?.status === client_1.PayoutStatus.paid ? 'Paid' : r.payoutItem?.status === client_1.PayoutStatus.triggered ? 'Triggered' : 'Pending',
        }));
    }
    async approveSubmission(adminId, submissionId, codeVerified) {
        if (!codeVerified)
            throw new common_1.BadRequestException('Code must be verified before approval');
        const submission = await this.prisma.clipSubmission.findUnique({ where: { id: submissionId } });
        if (!submission || submission.status !== client_1.SubmissionStatus.pending_review) {
            throw new common_1.NotFoundException('Submission not in pending review');
        }
        await this.prisma.$transaction([
            this.prisma.submissionReview.create({
                data: {
                    submissionId,
                    reviewerId: adminId,
                    codeVerified: true,
                    approved: true,
                },
            }),
            this.prisma.clipSubmission.update({
                where: { id: submissionId },
                data: { status: client_1.SubmissionStatus.approved_awaiting_views },
            }),
        ]);
        await this.audit.log({
            actorId: adminId,
            action: 'submission.approved',
            entityType: 'clip_submission',
            entityId: submissionId,
        });
        return { success: true };
    }
    async rejectSubmission(adminId, submissionId, reason) {
        const submission = await this.prisma.clipSubmission.findUnique({ where: { id: submissionId } });
        if (!submission || submission.status !== client_1.SubmissionStatus.pending_review) {
            throw new common_1.NotFoundException('Submission not in pending review');
        }
        await this.prisma.$transaction([
            this.prisma.submissionReview.create({
                data: {
                    submissionId,
                    reviewerId: adminId,
                    codeVerified: false,
                    approved: false,
                    rejectionReason: reason,
                },
            }),
            this.prisma.clipSubmission.update({
                where: { id: submissionId },
                data: { status: client_1.SubmissionStatus.rejected },
            }),
        ]);
        await this.audit.log({
            actorId: adminId,
            action: 'submission.rejected',
            entityType: 'clip_submission',
            entityId: submissionId,
            metadata: { reason },
        });
        return { success: true };
    }
    async verifyViews(adminId, submissionId, viewCount) {
        if (viewCount <= 0)
            throw new common_1.BadRequestException('View count must be positive');
        const submission = await this.prisma.clipSubmission.findUnique({
            where: { id: submissionId },
            include: { campaign: true },
        });
        if (!submission || submission.status !== client_1.SubmissionStatus.approved_awaiting_views) {
            throw new common_1.NotFoundException('Submission not awaiting view verification');
        }
        const platformFee = Number(this.config.get('PLATFORM_FEE_PERCENT', 20));
        const { gross, clipper, platform } = (0, money_1.clipperEarningsKobo)(viewCount, submission.campaign.cpmKobo, platformFee);
        await this.prisma.$transaction(async (tx) => {
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
                    status: client_1.SubmissionStatus.views_verified,
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
                    status: client_1.PayoutStatus.pending,
                },
            });
        });
        await this.audit.log({
            actorId: adminId,
            action: 'submission.views_verified',
            entityType: 'clip_submission',
            entityId: submissionId,
            metadata: { viewCount, earningsKobo: clipper },
        });
        return { success: true, earnings: (0, money_1.koboToNaira)(clipper) };
    }
    async triggerPayout(adminId, submissionId) {
        const submission = await this.prisma.clipSubmission.findUnique({
            where: { id: submissionId },
            include: { payoutItem: true, clipper: { include: { clipperProfile: true } } },
        });
        if (!submission || submission.status !== client_1.SubmissionStatus.views_verified || !submission.payoutItem) {
            throw new common_1.NotFoundException('Submission not ready for payout');
        }
        await this.prisma.$transaction([
            this.prisma.payoutItem.update({
                where: { id: submission.payoutItem.id },
                data: { status: client_1.PayoutStatus.triggered, paystackRef: `demo_${Date.now()}` },
            }),
            this.prisma.clipSubmission.update({
                where: { id: submissionId },
                data: { status: client_1.SubmissionStatus.payout_triggered },
            }),
        ]);
        await this.audit.log({
            actorId: adminId,
            action: 'payout.triggered',
            entityType: 'clip_submission',
            entityId: submissionId,
        });
        return { success: true, status: 'Triggered' };
    }
    async listAllCampaigns() {
        const campaigns = await this.prisma.campaign.findMany({
            include: { funderProfile: true },
            orderBy: { createdAt: 'desc' },
        });
        return campaigns.map((c) => ({
            id: c.id,
            name: c.name,
            funder: c.funderProfile.businessName,
            cpm: (0, money_1.koboToNaira)(c.cpmKobo),
            budget: (0, money_1.koboToNaira)(c.budgetKobo),
            remaining: (0, money_1.koboToNaira)(c.remainingKobo),
            views: c.totalViews,
            clips: c.clipCount,
            platforms: c.platforms,
            status: c.status,
            end: c.endDate?.toISOString().slice(0, 10) ?? '',
        }));
    }
    async listPayouts() {
        const items = await this.prisma.payoutItem.findMany({
            include: {
                submission: {
                    include: {
                        campaign: true,
                        clipper: { include: { clipperProfile: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return items.map((p) => ({
            id: p.id,
            date: p.createdAt.toISOString().slice(0, 10),
            clipper: p.submission.clipper.clipperProfile?.displayName ?? 'Unknown',
            campaign: p.submission.campaign.name,
            amount: (0, money_1.koboToNaira)(p.amountKobo),
            status: p.status === client_1.PayoutStatus.paid ? 'Paid' : p.status === client_1.PayoutStatus.triggered ? 'Triggered' : 'Pending',
        }));
    }
    async listAuditLogs() {
        const logs = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { actor: true },
        });
        return logs.map((l) => ({
            id: l.id,
            action: l.action,
            entityType: l.entityType,
            entityId: l.entityId,
            actor: l.actor?.email ?? 'system',
            createdAt: l.createdAt,
            metadata: l.metadata,
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], AdminService);
//# sourceMappingURL=admin.service.js.map