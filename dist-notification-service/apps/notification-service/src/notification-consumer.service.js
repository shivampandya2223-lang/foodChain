"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafka_topic_enum_1 = require("../../../src/common/enums/kafka-topic.enum");
const kafka_client_factory_1 = require("../../../src/kafka/kafka-client.factory");
let NotificationConsumerService = NotificationConsumerService_1 = class NotificationConsumerService {
    configService;
    logger = new common_1.Logger(NotificationConsumerService_1.name);
    topics = [
        kafka_topic_enum_1.KafkaTopic.ORDER_CREATED,
        kafka_topic_enum_1.KafkaTopic.ORDER_UPDATED,
        kafka_topic_enum_1.KafkaTopic.TASK_CREATED,
    ];
    consumedByTopic = {};
    consumer;
    connected = false;
    lastEventAt;
    lastEventName;
    lastError;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        if (!this.isEnabled()) {
            this.logger.log('Kafka consumer disabled');
            return;
        }
        const kafka = (0, kafka_client_factory_1.createKafkaClient)(this.configService, 'food-chain-notification');
        const consumer = kafka.consumer({
            groupId: this.configService.get('KAFKA_NOTIFICATION_GROUP_ID', 'food-chain-notification'),
        });
        this.consumer = consumer;
        try {
            await consumer.connect();
            this.connected = true;
        }
        catch (error) {
            this.connected = false;
            this.lastError = error instanceof Error ? error.message : String(error);
            throw error;
        }
        for (const topic of this.topics) {
            await consumer.subscribe({ topic, fromBeginning: false });
        }
        await consumer.run({
            eachMessage: (payload) => Promise.resolve(this.handleMessage(payload)),
        });
    }
    async onApplicationShutdown() {
        if (this.consumer) {
            await this.consumer.disconnect();
            this.connected = false;
        }
    }
    getStatus() {
        return {
            service: 'food-chain-notification-service',
            enabled: this.isEnabled(),
            connected: this.connected,
            brokers: (0, kafka_client_factory_1.getKafkaBrokers)(this.configService),
            groupId: this.configService.get('KAFKA_NOTIFICATION_GROUP_ID', 'food-chain-notification'),
            topics: this.topics,
            consumedByTopic: this.consumedByTopic,
            lastEventAt: this.lastEventAt,
            lastEventName: this.lastEventName,
            lastError: this.lastError,
        };
    }
    handleMessage({ topic, message }) {
        if (!message.value) {
            return;
        }
        const event = JSON.parse(message.value.toString());
        this.recordEvent(topic, event);
        switch (topic) {
            case kafka_topic_enum_1.KafkaTopic.ORDER_CREATED:
                this.logger.log(`Notify kitchen for order ${event.payload.orderNumber}`);
                break;
            case kafka_topic_enum_1.KafkaTopic.ORDER_UPDATED:
                this.logger.log(`Notify status update ${event.payload.status}`);
                break;
            case kafka_topic_enum_1.KafkaTopic.TASK_CREATED:
                this.logger.log(`Notify task assignee ${event.payload.assignedToId ?? 'unassigned'}`);
                break;
        }
    }
    recordEvent(topic, event) {
        this.consumedByTopic[topic] = (this.consumedByTopic[topic] ?? 0) + 1;
        this.lastEventAt = event.occurredAt;
        this.lastEventName = event.eventName;
    }
    isEnabled() {
        return this.configService.get('KAFKA_ENABLED') ?? false;
    }
};
exports.NotificationConsumerService = NotificationConsumerService;
exports.NotificationConsumerService = NotificationConsumerService = NotificationConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationConsumerService);
//# sourceMappingURL=notification-consumer.service.js.map