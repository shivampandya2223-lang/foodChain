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
var InventoryConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafka_topic_enum_1 = require("../../../src/common/enums/kafka-topic.enum");
const kafka_client_factory_1 = require("../../../src/kafka/kafka-client.factory");
let InventoryConsumerService = InventoryConsumerService_1 = class InventoryConsumerService {
    configService;
    logger = new common_1.Logger(InventoryConsumerService_1.name);
    topics = [
        kafka_topic_enum_1.KafkaTopic.ORDER_CREATED,
        kafka_topic_enum_1.KafkaTopic.ORDER_CANCELLED,
        kafka_topic_enum_1.KafkaTopic.INVENTORY_STOCK_IN,
        kafka_topic_enum_1.KafkaTopic.INVENTORY_STOCK_OUT,
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
        const kafka = (0, kafka_client_factory_1.createKafkaClient)(this.configService, 'food-chain-inventory');
        const consumer = kafka.consumer({
            groupId: this.configService.get('KAFKA_INVENTORY_GROUP_ID', 'food-chain-inventory'),
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
            service: 'food-chain-inventory-service',
            enabled: this.isEnabled(),
            connected: this.connected,
            brokers: (0, kafka_client_factory_1.getKafkaBrokers)(this.configService),
            groupId: this.configService.get('KAFKA_INVENTORY_GROUP_ID', 'food-chain-inventory'),
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
                this.handleOrderCreated(event);
                break;
            case kafka_topic_enum_1.KafkaTopic.ORDER_CANCELLED:
                this.handleOrderCancelled(event);
                break;
            case kafka_topic_enum_1.KafkaTopic.INVENTORY_STOCK_IN:
            case kafka_topic_enum_1.KafkaTopic.INVENTORY_STOCK_OUT:
                this.handleInventoryChanged(event);
                break;
        }
    }
    handleOrderCreated(event) {
        this.logger.log(`Process inventory for order ${event.payload.orderNumber}`);
    }
    handleOrderCancelled(event) {
        this.logger.log(`Rollback inventory for cancelled order ${event.payload.orderNumber}`);
    }
    handleInventoryChanged(event) {
        this.logger.log(`Inventory ${event.payload.type} ${event.payload.quantity} for item ${event.payload.inventoryItemId}`);
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
exports.InventoryConsumerService = InventoryConsumerService;
exports.InventoryConsumerService = InventoryConsumerService = InventoryConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], InventoryConsumerService);
//# sourceMappingURL=inventory-consumer.service.js.map