import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { DomainEvent } from '../contracts/events/domain-event.type';
export declare class KafkaProducerService implements OnModuleInit, OnApplicationShutdown {
    private readonly configService;
    private readonly logger;
    private producer?;
    private readonly isEnabled;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    publish<TPayload extends Record<string, unknown>>(topic: KafkaTopic, event: DomainEvent<TPayload>, key?: string): Promise<void>;
    canPublish(): boolean;
    onApplicationShutdown(): Promise<void>;
}
