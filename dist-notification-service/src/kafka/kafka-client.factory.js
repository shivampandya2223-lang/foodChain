"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaClient = createKafkaClient;
exports.getKafkaBrokers = getKafkaBrokers;
const kafkajs_1 = require("kafkajs");
function createKafkaClient(configService, clientId) {
    const kafkaConfig = {
        clientId: clientId ?? configService.get('KAFKA_CLIENT_ID'),
        brokers: getKafkaBrokers(configService),
        ssl: configService.get('KAFKA_SSL') ?? false,
    };
    const sasl = getKafkaSasl(configService);
    if (sasl) {
        kafkaConfig.sasl = sasl;
    }
    return new kafkajs_1.Kafka(kafkaConfig);
}
function getKafkaBrokers(configService) {
    return configService
        .get('KAFKA_BROKERS', 'localhost:9092')
        .split(',')
        .map((broker) => broker.trim())
        .filter(Boolean);
}
function getKafkaSasl(configService) {
    const mechanism = configService.get('KAFKA_SASL_MECHANISM', '');
    if (!mechanism) {
        return undefined;
    }
    const username = configService.get('KAFKA_SASL_USERNAME', '');
    const password = configService.get('KAFKA_SASL_PASSWORD', '');
    if (!username || !password) {
        return undefined;
    }
    return {
        mechanism: mechanism,
        username,
        password,
    };
}
//# sourceMappingURL=kafka-client.factory.js.map