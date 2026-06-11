import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
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

  onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async publishPendingEvents() {
    if (this.isPublishing || !this.kafkaProducer.canPublish()) {
      return;
    }

    this.isPublishing = true;

    try {
      const events = await this.outboxRepository.find({
        where: { status: OutboxEventStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: this.getBatchSize(),
      });

      for (const outboxEvent of events) {
        await this.publishEvent(outboxEvent);
      }
    } finally {
      this.isPublishing = false;
    }
  }

  private async publishEvent(outboxEvent: OutboxEvent) {
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
      await this.outboxRepository.save(outboxEvent);
    } catch (error) {
      outboxEvent.attempts += 1;
      outboxEvent.lastError =
        error instanceof Error ? error.message : String(error);

      if (outboxEvent.attempts >= this.getMaxAttempts()) {
        outboxEvent.status = OutboxEventStatus.FAILED;
      }

      await this.outboxRepository.save(outboxEvent);
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
