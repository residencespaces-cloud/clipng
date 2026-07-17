import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupClipperDto, SignupFunderDto } from './dto/auth.dto';

export type JwtPayload = { sub: string; email: string; role: UserRole };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-secret',
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

  async signupClipper(dto: SignupClipperDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.clipper,
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

  async signupFunder(dto: SignupFunderDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.funder,
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { clipperProfile: true, funderProfile: true },
    });
    if (!user) throw new UnauthorizedException();
    const name =
      user.clipperProfile?.displayName ??
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
}
