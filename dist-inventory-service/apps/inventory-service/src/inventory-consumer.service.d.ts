import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaTopic } from '../../../src/common/enums/kafka-topic.enum';
export declare class InventoryConsumerService implements OnModuleInit, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private readonly topics;
    private readonly consumedByTopic;
    private consumer?;
    private connected;
    private lastEventAt?;
    private lastEventName?;
    private lastError?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    getStatus(): {
        service: string;
        enabled: boolean;
        connected: boolean;
        brokers: string[];
        groupId: string;
        topics: KafkaTopic[];
        consumedByTopic: Partial<Record<KafkaTopic, number>>;
        lastEventAt: string | undefined;
        lastEventName: string | undefined;
        lastError: string | undefined;
    };
    private handleMessage;
    private handleOrderCreated;
    private handleOrderCancelled;
    private handleInventoryChanged;
    private recordEvent;
    private isEnabled;
}
