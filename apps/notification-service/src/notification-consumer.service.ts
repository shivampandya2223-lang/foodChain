import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaTopic } from '../../../src/common/enums/kafka-topic.enum';
import { DomainEvent } from '../../../src/contracts/events/domain-event.type';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
} from '../../../src/contracts/events/order.events';
import { TaskCreatedEvent } from '../../../src/contracts/events/task.events';
import {
  createKafkaClient,
  getKafkaBrokers,
} from '../../../src/kafka/kafka-client.factory';

@Injectable()
export class NotificationConsumerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(NotificationConsumerService.name);
  private readonly topics = [
    KafkaTopic.ORDER_CREATED,
    KafkaTopic.ORDER_UPDATED,
    KafkaTopic.TASK_CREATED,
  ];
  private readonly consumedByTopic: Partial<Record<KafkaTopic, number>> = {};
  private consumer?: Consumer;
  private connected = false;
  private lastEventAt?: string;
  private lastEventName?: string;
  private lastError?: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log('Kafka consumer disabled');
      return;
    }

    const kafka = createKafkaClient(
      this.configService,
      'food-chain-notification',
    );
    const consumer = kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_NOTIFICATION_GROUP_ID',
        'food-chain-notification',
      ),
    });
    this.consumer = consumer;

    try {
      await consumer.connect();
      this.connected = true;
    } catch (error) {
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
      brokers: getKafkaBrokers(this.configService),
      groupId: this.configService.get<string>(
        'KAFKA_NOTIFICATION_GROUP_ID',
        'food-chain-notification',
      ),
      topics: this.topics,
      consumedByTopic: this.consumedByTopic,
      lastEventAt: this.lastEventAt,
      lastEventName: this.lastEventName,
      lastError: this.lastError,
    };
  }

  private handleMessage({ topic, message }: EachMessagePayload) {
    if (!message.value) {
      return;
    }

    const event = JSON.parse(message.value.toString()) as DomainEvent<
      Record<string, unknown>
    >;
    this.recordEvent(topic as KafkaTopic, event);

    switch (topic as KafkaTopic) {
      case KafkaTopic.ORDER_CREATED:
        this.logger.log(
          `Notify kitchen for order ${(event as OrderCreatedEvent).payload.orderNumber}`,
        );
        break;
      case KafkaTopic.ORDER_UPDATED:
        this.logger.log(
          `Notify status update ${(event as OrderUpdatedEvent).payload.status}`,
        );
        break;
      case KafkaTopic.TASK_CREATED:
        this.logger.log(
          `Notify task assignee ${(event as TaskCreatedEvent).payload.assignedToId ?? 'unassigned'}`,
        );
        break;
    }
  }

  private recordEvent(
    topic: KafkaTopic,
    event: DomainEvent<Record<string, unknown>>,
  ) {
    this.consumedByTopic[topic] = (this.consumedByTopic[topic] ?? 0) + 1;
    this.lastEventAt = event.occurredAt;
    this.lastEventName = event.eventName;
  }

  private isEnabled() {
    return this.configService.get<boolean>('KAFKA_ENABLED') ?? false;
  }
}
