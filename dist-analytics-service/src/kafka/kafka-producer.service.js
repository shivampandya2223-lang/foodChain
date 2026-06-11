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
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafka_client_factory_1 = require("./kafka-client.factory");
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    configService;
    logger = new common_1.Logger(KafkaProducerService_1.name);
    producer;
    isEnabled;
    constructor(configService) {
        this.configService = configService;
        this.isEnabled = this.configService.get('KAFKA_ENABLED') ?? false;
    }
    async onModuleInit() {
        if (!this.isEnabled) {
            this.logger.log('Kafka producer disabled');
            return;
        }
        const kafka = (0, kafka_client_factory_1.createKafkaClient)(this.configService);
        this.producer = kafka.producer();
        await this.producer.connect();
        this.logger.log(`Kafka producer connected to ${(0, kafka_client_factory_1.getKafkaBrokers)(this.configService).join(', ')}`);
    }
    async publish(topic, event, key) {
        if (!this.producer) {
            return;
        }
        await this.producer.send({
            topic,
            messages: [
                {
                    key,
                    value: JSON.stringify(event),
                    headers: {
                        eventName: event.eventName,
                        eventId: event.eventId,
                        occurredAt: event.occurredAt,
                    },
                },
            ],
        });
    }
    canPublish() {
        return Boolean(this.producer);
    }
    async onApplicationShutdown() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaProducerService);
//# sourceMappingURL=kafka-producer.service.js.map