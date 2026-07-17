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
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const auth_guards_1 = require("../common/guards/auth.guards");
const submission_dto_1 = require("./dto/submission.dto");
const submissions_service_1 = require("./submissions.service");
let SubmissionsController = class SubmissionsController {
    constructor(submissions) {
        this.submissions = submissions;
    }
    create(req, dto) {
        return this.submissions.create(req.user.id, dto);
    }
    listMine(req) {
        return this.submissions.listMine(req.user.id);
    }
    earnings(req) {
        return this.submissions.getEarningsSummary(req.user.id);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)('submissions'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.clipper),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submission_dto_1.CreateSubmissionDto]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('submissions/me'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.clipper),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "listMine", null);
__decorate([
    (0, common_1.Get)('earnings/me'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.clipper),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "earnings", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map