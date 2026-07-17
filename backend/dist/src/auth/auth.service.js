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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async issueTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET') ?? 'dev-secret',
            expiresIn: '15m',
        });
        const refreshToken = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: this.hashToken(refreshToken),
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    async signupClipper(dto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                role: client_1.UserRole.clipper,
                clipperProfile: {
                    create: {
                        displayName: dto.name,
                        phone: dto.phone,
                        bankName: dto.bankName,
                        accountNumber: dto.accountNumber,
                    },
                },
            },
            include: { clipperProfile: true },
        });
        return this.issueTokens(user);
    }
    async signupFunder(dto) {
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                role: client_1.UserRole.funder,
                funderProfile: {
                    create: {
                        businessName: dto.business,
                        phone: dto.phone,
                        wallet: { create: {} },
                    },
                },
            },
            include: { funderProfile: true },
        });
        return this.issueTokens(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const stored = await this.prisma.refreshToken.findFirst({
            where: { tokenHash, expiresAt: { gt: new Date() } },
            include: { user: true },
        });
        if (!stored)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        return this.issueTokens(stored.user);
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
        return { success: true };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { clipperProfile: true, funderProfile: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        const name = user.clipperProfile?.displayName ??
            user.funderProfile?.businessName ??
            user.email;
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name,
            status: user.status,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map