import { OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private client;
    private readonly logger;
    constructor();
    getClient(): Redis;
    onModuleDestroy(): Promise<void>;
}
