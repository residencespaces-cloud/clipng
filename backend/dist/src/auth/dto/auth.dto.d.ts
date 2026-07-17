import { UserRole } from '@prisma/client';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SignupClipperDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    bankName: string;
    accountNumber: string;
}
export declare class SignupFunderDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    business: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthUserDto {
    id: string;
    email: string;
    role: UserRole;
    name: string;
}
