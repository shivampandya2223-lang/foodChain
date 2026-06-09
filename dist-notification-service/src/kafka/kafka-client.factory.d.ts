import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
export declare function createKafkaClient(configService: ConfigService, clientId?: string): Kafka;
export declare function getKafkaBrokers(configService: ConfigService): string[];
