import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisCacheService implements OnModuleInit, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private client?;
    private connected;
    private lastError?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getStatus(): {
        enabled: boolean;
        connected: boolean;
        url: string | undefined;
        lastError: string | undefined;
    };
    setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    getJson<TValue>(key: string): Promise<TValue | undefined>;
    delete(key: string): Promise<void>;
    incrementHashBy(key: string, field: string, amount: number): Promise<void>;
    private isEnabled;
}
