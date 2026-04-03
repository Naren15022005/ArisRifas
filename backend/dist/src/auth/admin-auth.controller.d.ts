import { AuthService } from './auth.service';
import { PrismaService } from '../lib/prisma.service';
declare class AdminLoginDto {
    email: string;
    password: string;
}
declare class AdminRegisterDto {
    email: string;
    password: string;
    name: string;
}
export declare class AdminAuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    login(body: AdminLoginDto): Promise<{
        access_token: string;
    }>;
    register(body: AdminRegisterDto): Promise<{
        access_token: string;
    }>;
}
export {};
