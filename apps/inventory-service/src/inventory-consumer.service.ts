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
import { InventoryChangedEvent } from '../../../src/contracts/events/inventory.events';
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
} from '../../../src/contracts/events/order.events';
import {
  createKafkaClient,
  getKafkaBrokers,
} from '../../../src/kafka/kafka-client.factory';

@Injectable()
export class InventoryConsumerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(InventoryConsumerService.name);
  private readonly topics = [
    KafkaTopic.ORDER_CREATED,
    KafkaTopic.ORDER_CANCELLED,
    KafkaTopic.INVENTORY_STOCK_IN,
    KafkaTopic.INVENTORY_STOCK_OUT,
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

    const kafka = createKafkaClient(this.configService, 'food-chain-inventory');
    const consumer = kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_INVENTORY_GROUP_ID',
        'food-chain-inventory',
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
      service: 'food-chain-inventory-service',
      enabled: this.isEnabled(),
      connected: this.connected,
      brokers: getKafkaBrokers(this.configService),
      groupId: this.configService.get<string>(
        'KAFKA_INVENTORY_GROUP_ID',
        'food-chain-inventory',
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
        this.handleOrderCreated(event as OrderCreatedEvent);
        break;
      case KafkaTopic.ORDER_CANCELLED:
        this.handleOrderCancelled(event as OrderCancelledEvent);
        break;
      case KafkaTopic.INVENTORY_STOCK_IN:
      case KafkaTopic.INVENTORY_STOCK_OUT:
        this.handleInventoryChanged(event as InventoryChangedEvent);
        break;
    }
  }

  private handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Process inventory for order ${event.payload.orderNumber}`);
  }

  private handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(
      `Rollback inventory for cancelled order ${event.payload.orderNumber}`,
    );
  }

  private handleInventoryChanged(event: InventoryChangedEvent) {
    this.logger.log(
      `Inventory ${event.payload.type} ${event.payload.quantity} for item ${event.payload.inventoryItemId}`,
    );
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
