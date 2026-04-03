import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../lib/prisma.service';
import type { User } from '@prisma/client';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null>;
    login(user: Pick<User, 'id' | 'email' | 'role'>): Promise<{
        access_token: string;
    }>;
}
