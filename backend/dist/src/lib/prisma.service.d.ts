import { OnModuleDestroy } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
export declare class PrismaService implements OnModuleDestroy {
    get client(): PrismaClient;
    onModuleDestroy(): Promise<void>;
}
