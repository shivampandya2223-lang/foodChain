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
var AnalyticsConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafka_topic_enum_1 = require("../../../src/common/enums/kafka-topic.enum");
const kafka_client_factory_1 = require("../../../src/kafka/kafka-client.factory");
let AnalyticsConsumerService = AnalyticsConsumerService_1 = class AnalyticsConsumerService {
    configService;
    logger = new common_1.Logger(AnalyticsConsumerService_1.name);
    topics = Object.values(kafka_topic_enum_1.KafkaTopic);
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
        const kafka = (0, kafka_client_factory_1.createKafkaClient)(this.configService, 'food-chain-analytics');
        const consumer = kafka.consumer({
            groupId: this.configService.get('KAFKA_ANALYTICS_GROUP_ID', 'food-chain-analytics'),
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
            service: 'food-chain-analytics-service',
            enabled: this.isEnabled(),
            connected: this.connected,
            brokers: (0, kafka_client_factory_1.getKafkaBrokers)(this.configService),
            groupId: this.configService.get('KAFKA_ANALYTICS_GROUP_ID', 'food-chain-analytics'),
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
        this.consumedByTopic[topic] =
            (this.consumedByTopic[topic] ?? 0) + 1;
        this.lastEventAt = event.occurredAt;
        this.lastEventName = event.eventName;
        this.logger.log(`Analytics recorded ${topic} event ${event.eventId}`);
    }
    isEnabled() {
        return this.configService.get('KAFKA_ENABLED') ?? false;
    }
};
exports.AnalyticsConsumerService = AnalyticsConsumerService;
exports.AnalyticsConsumerService = AnalyticsConsumerService = AnalyticsConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AnalyticsConsumerService);
//# sourceMappingURL=analytics-consumer.service.js.map