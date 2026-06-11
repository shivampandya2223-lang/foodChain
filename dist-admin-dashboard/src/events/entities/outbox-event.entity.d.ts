import { KafkaTopic } from '../../common/enums/kafka-topic.enum';
export declare enum OutboxEventStatus {
    PENDING = "PENDING",
    PUBLISHED = "PUBLISHED",
    FAILED = "FAILED"
}
export declare class OutboxEvent {
    id: string;
    eventId: string;
    topic: KafkaTopic;
    eventName: string;
    aggregateId?: string;
    aggregateType?: string;
    partitionKey?: string;
    payload: Record<string, unknown>;
    status: OutboxEventStatus;
    attempts: number;
    lastError?: string;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
