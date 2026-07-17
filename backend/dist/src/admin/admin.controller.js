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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const auth_guards_1 = require("../common/guards/auth.guards");
const admin_service_1 = require("./admin.service");
class ApproveDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApproveDto.prototype, "codeVerified", void 0);
class RejectDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectDto.prototype, "reason", void 0);
class VerifyViewsDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VerifyViewsDto.prototype, "viewCount", void 0);
let AdminController = class AdminController {
    constructor(admin) {
        this.admin = admin;
    }
    listPending() {
        return this.admin.listPending();
    }
    listAwaitingViews() {
        return this.admin.listAwaitingViews();
    }
    listReadyForPayout() {
        return this.admin.listReadyForPayout();
    }
    listPayouts() {
        return this.admin.listPayouts();
    }
    approve(req, id, dto) {
        return this.admin.approveSubmission(req.user.id, id, dto.codeVerified);
    }
    reject(req, id, dto) {
        return this.admin.rejectSubmission(req.user.id, id, dto.reason);
    }
    verifyViews(req, id, dto) {
        return this.admin.verifyViews(req.user.id, id, dto.viewCount);
    }
    triggerPayout(req, id) {
        return this.admin.triggerPayout(req.user.id, id);
    }
    listCampaigns() {
        return this.admin.listAllCampaigns();
    }
    auditLogs() {
        return this.admin.listAuditLogs();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('submissions/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPending", null);
__decorate([
    (0, common_1.Get)('submissions/awaiting-views'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listAwaitingViews", null);
__decorate([
    (0, common_1.Get)('payouts/ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listReadyForPayout", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listPayouts", null);
__decorate([
    (0, common_1.Post)('submissions/:id/approve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ApproveDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('submissions/:id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, RejectDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('submissions/:id/verify-views'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, VerifyViewsDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verifyViews", null);
__decorate([
    (0, common_1.Post)('payouts/:id/trigger'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "triggerPayout", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "listCampaigns", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "auditLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.admin),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map