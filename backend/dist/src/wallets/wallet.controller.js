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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const auth_guards_1 = require("../common/guards/auth.guards");
const wallet_service_1 = require("./wallet.service");
const class_validator_1 = require("class-validator");
class TopUpDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    __metadata("design:type", Number)
], TopUpDto.prototype, "amount", void 0);
let WalletController = class WalletController {
    constructor(wallet) {
        this.wallet = wallet;
    }
    getBalance(req) {
        return this.wallet.getBalance(req.user.id);
    }
    getTransactions(req) {
        return this.wallet.getTransactions(req.user.id);
    }
    initiateTopUp(req, dto) {
        return this.wallet.initiateTopUp(req.user.id, dto.amount);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('topups/initiate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TopUpDto]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "initiateTopUp", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.funder),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map