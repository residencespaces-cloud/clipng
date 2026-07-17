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
exports.CampaignsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const auth_guards_1 = require("../common/guards/auth.guards");
const campaigns_service_1 = require("./campaigns.service");
const campaign_dto_1 = require("./dto/campaign.dto");
let CampaignsController = class CampaignsController {
    constructor(campaigns) {
        this.campaigns = campaigns;
    }
    listLive() {
        return this.campaigns.listLive();
    }
    listMy(req) {
        return this.campaigns.listMy(req.user.id);
    }
    getById(id) {
        return this.campaigns.getById(id);
    }
    create(req, dto) {
        return this.campaigns.create(req.user.id, dto);
    }
    join(req, id) {
        return this.campaigns.joinCampaign(req.user.id, id);
    }
};
exports.CampaignsController = CampaignsController;
__decorate([
    (0, common_1.Get)('live'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.clipper),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "listLive", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.funder),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "listMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.funder),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, campaign_dto_1.CreateCampaignDto]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.clipper),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CampaignsController.prototype, "join", null);
exports.CampaignsController = CampaignsController = __decorate([
    (0, common_1.Controller)('campaigns'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    __metadata("design:paramtypes", [campaigns_service_1.CampaignsService])
], CampaignsController);
//# sourceMappingURL=campaigns.controller.js.map