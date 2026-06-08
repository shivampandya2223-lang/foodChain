import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Producer } from 'kafkajs';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { DomainEvent } from '../contracts/events/domain-event.type';
import { createKafkaClient, getKafkaBrokers } from './kafka-client.factory';

@Injectable()
export class KafkaProducerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer?: Producer;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('KAFKA_ENABLED') ?? false;
  }

  async onModuleInit() {
    if (!this.isEnabled) {
      this.logger.log('Kafka producer disabled');
      return;
    }

    const kafka = createKafkaClient(this.configService);

    this.producer = kafka.producer();
    await this.producer.connect();
    this.logger.log(
      `Kafka producer connected to ${getKafkaBrokers(this.configService).join(', ')}`,
    );
  }

  async publish<TPayload extends Record<string, unknown>>(
    topic: KafkaTopic,
    event: DomainEvent<TPayload>,
    key?: string,
  ) {
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

  async onApplicationShutdown() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}
