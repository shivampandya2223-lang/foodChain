import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document } from 'mongodb';
export declare class MongoEventStoreService implements OnModuleInit, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private client?;
    private collection?;
    private connected;
    private lastError?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getStatus(): {
        enabled: boolean;
        connected: boolean;
        uri: string | undefined;
        database: string | undefined;
        collection: string | undefined;
        lastError: string | undefined;
    };
    insertEvent(event: Document): Promise<void>;
    private isEnabled;
}
