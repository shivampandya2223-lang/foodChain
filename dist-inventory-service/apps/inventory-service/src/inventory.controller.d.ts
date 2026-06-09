import { InventoryConsumerService } from './inventory-consumer.service';
export declare class InventoryController {
    private readonly consumerService;
    constructor(consumerService: InventoryConsumerService);
    getRoot(): {
        service: string;
        status: string;
    };
    getHealth(): {
        service: string;
        healthy: boolean;
        kafka: {
            service: string;
            enabled: boolean;
            connected: boolean;
            brokers: string[];
            groupId: string;
            topics: import("../../../src/common/enums/kafka-topic.enum").KafkaTopic[];
            consumedByTopic: Partial<Record<import("../../../src/common/enums/kafka-topic.enum").KafkaTopic, number>>;
            lastEventAt: string | undefined;
            lastEventName: string | undefined;
            lastError: string | undefined;
        };
    };
    getStatus(): {
        service: string;
        enabled: boolean;
        connected: boolean;
        brokers: string[];
        groupId: string;
        topics: import("../../../src/common/enums/kafka-topic.enum").KafkaTopic[];
        consumedByTopic: Partial<Record<import("../../../src/common/enums/kafka-topic.enum").KafkaTopic, number>>;
        lastEventAt: string | undefined;
        lastEventName: string | undefined;
        lastError: string | undefined;
    };
}
