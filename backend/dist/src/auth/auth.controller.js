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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const auth_guards_1 = require("../common/guards/auth.guards");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    signupClipper(dto) {
        return this.auth.signupClipper(dto);
    }
    signupFunder(dto) {
        return this.auth.signupFunder(dto);
    }
    login(dto) {
        return this.auth.login(dto);
    }
    refresh(dto) {
        return this.auth.refresh(dto.refreshToken);
    }
    logout(dto) {
        return this.auth.logout(dto.refreshToken);
    }
    me(req) {
        return this.auth.getMe(req.user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('signup/clipper'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupClipperDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signupClipper", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('signup/funder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupFunderDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signupFunder", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map