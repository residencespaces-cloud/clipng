import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, SignupClipperDto, SignupFunderDto } from './dto/auth.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        success: boolean;
    }>;
    me(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
}
