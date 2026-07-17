import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupClipperDto, SignupFunderDto } from './dto/auth.dto';
export type JwtPayload = {
    sub: string;
    email: string;
    role: UserRole;
};
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    private hashToken;
    private issueTokens;
    signupClipper(dto: SignupClipperDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    signupFunder(dto: SignupFunderDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
}
