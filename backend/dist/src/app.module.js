"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const admin_module_1 = require("./admin/admin.module");
const audit_module_1 = require("./audit/audit.module");
const auth_module_1 = require("./auth/auth.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const auth_guards_1 = require("./common/guards/auth.guards");
const health_controller_1 = require("./health.controller");
const jobs_module_1 = require("./jobs/jobs.module");
const notifications_module_1 = require("./notifications/notifications.module");
const prisma_module_1 = require("./prisma/prisma.module");
const storage_module_1 = require("./storage/storage.module");
const submissions_module_1 = require("./submissions/submissions.module");
const wallets_module_1 = require("./wallets/wallets.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            wallets_module_1.WalletsModule,
            campaigns_module_1.CampaignsModule,
            submissions_module_1.SubmissionsModule,
            admin_module_1.AdminModule,
            webhooks_module_1.WebhooksModule,
            notifications_module_1.NotificationsModule,
            storage_module_1.StorageModule,
            jobs_module_1.JobsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: auth_guards_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: auth_guards_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map