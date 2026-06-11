import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import { DomainEvent } from '../contracts/events/domain-event.type';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { OutboxEvent, OutboxEventStatus } from './entities/outbox-event.entity';

@Injectable()
export class OutboxPublisherService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(OutboxPublisherService.name);
  private timer?: ReturnType<typeof setInterval>;
  private isPublishing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log('Outbox publisher disabled');
      return;
    }

    this.timer = setInterval(() => {
      void this.publishPendingEvents();
    }, this.getPollIntervalMs());
  }

  async onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    while (this.isPublishing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  async publishPendingEvents() {
    if (this.isPublishing || !this.kafkaProducer.canPublish()) {
      return;
    }

    this.isPublishing = true;

    try {
      await this.dataSource.transaction(async (manager) => {
        const events = await manager
          .getRepository(OutboxEvent)
          .createQueryBuilder('outbox')
          .where('outbox.status = :status', {
            status: OutboxEventStatus.PENDING,
          })
          .orderBy('outbox.createdAt', 'ASC')
          .take(this.getBatchSize())
          .setLock('pessimistic_write')
          .setOnLocked('skip_locked')
          .getMany();

        for (const outboxEvent of events) {
          await this.publishEvent(outboxEvent, manager);
        }
      });
    } finally {
      this.isPublishing = false;
    }
  }

  private async publishEvent(
    outboxEvent: OutboxEvent,
    manager: EntityManager,
  ) {
    const event: DomainEvent<Record<string, unknown>> = {
      eventId: outboxEvent.eventId,
      eventName: outboxEvent.eventName,
      occurredAt: outboxEvent.createdAt.toISOString(),
      payload: outboxEvent.payload,
    };

    try {
      await this.kafkaProducer.publish(
        outboxEvent.topic,
        event,
        outboxEvent.partitionKey ?? outboxEvent.aggregateId,
      );

      outboxEvent.status = OutboxEventStatus.PUBLISHED;
      outboxEvent.publishedAt = new Date();
      outboxEvent.lastError = undefined;
      await manager.save(outboxEvent);
    } catch (error) {
      outboxEvent.attempts += 1;
      outboxEvent.lastError =
        error instanceof Error ? error.message : String(error);

      if (outboxEvent.attempts >= this.getMaxAttempts()) {
        outboxEvent.status = OutboxEventStatus.FAILED;
      }

      await manager.save(outboxEvent);
      this.logger.error(
        `Outbox publish failed for ${outboxEvent.eventId}: ${outboxEvent.lastError}`,
      );
    }
  }

  private isEnabled() {
    return this.configService.get<boolean>('OUTBOX_PUBLISHER_ENABLED') ?? true;
  }

  private getPollIntervalMs() {
    return this.configService.get<number>('OUTBOX_POLL_INTERVAL_MS') ?? 100;
  }

  private getBatchSize() {
    return this.configService.get<number>('OUTBOX_BATCH_SIZE') ?? 100;
  }

  private getMaxAttempts() {
    return this.configService.get<number>('OUTBOX_MAX_ATTEMPTS') ?? 3;
  }
}
