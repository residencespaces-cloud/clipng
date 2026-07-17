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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const wallet_service_1 = require("../wallets/wallet.service");
let WebhooksController = class WebhooksController {
    constructor(prisma, wallet, config) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.config = config;
    }
    verifyPaystackSignature(payload, signature) {
        const secret = this.config.get('PAYSTACK_WEBHOOK_SECRET');
        if (!secret || !signature)
            return false;
        const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
        return hash === signature;
    }
    async paystack(body, signature) {
        const payload = JSON.stringify(body);
        const isValid = this.verifyPaystackSignature(payload, signature);
        const event = body.event;
        const data = body.data;
        const reference = data?.reference ?? `evt_${Date.now()}`;
        const existing = await this.prisma.paymentWebhook.findUnique({ where: { reference } });
        if (existing?.processed)
            return { received: true };
        await this.prisma.paymentWebhook.upsert({
            where: { reference },
            create: {
                eventType: event ?? 'unknown',
                reference,
                payload: body,
                processed: false,
            },
            update: {},
        });
        if (!isValid) {
            return { received: true, warning: 'invalid signature' };
        }
        if (event === 'charge.success' && data) {
            const amountKobo = Number(data.amount ?? 0);
            const metadata = data.metadata ?? {};
            await this.wallet.creditTopUp(reference, amountKobo, metadata);
        }
        await this.prisma.paymentWebhook.update({
            where: { reference },
            data: { processed: true, processedAt: new Date() },
        });
        return { received: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('paystack'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "paystack", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        config_1.ConfigService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map