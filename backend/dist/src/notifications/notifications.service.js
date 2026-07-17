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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async queueEmail(userId, subject, body, metadata) {
        return this.prisma.notification.create({
            data: {
                userId,
                channel: client_1.NotificationChannel.email,
                status: client_1.NotificationStatus.pending,
                subject,
                body,
                metadata: (metadata ?? undefined),
            },
        });
    }
    async processPending(limit = 20) {
        const pending = await this.prisma.notification.findMany({
            where: { status: client_1.NotificationStatus.pending },
            take: limit,
            orderBy: { createdAt: 'asc' },
        });
        for (const n of pending) {
            await this.prisma.notification.update({
                where: { id: n.id },
                data: { status: client_1.NotificationStatus.sent, sentAt: new Date() },
            });
        }
        return { processed: pending.length };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map