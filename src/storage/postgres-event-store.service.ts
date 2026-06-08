import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEventLog } from './entities/domain-event-log.entity';

type PersistedEvent = {
  eventId: string;
  eventName: string;
  topic?: string;
  sourceService: string;
  payload: Record<string, unknown>;
  occurredAt: string | Date;
};

@Injectable()
export class PostgresEventStoreService {
  constructor(
    @InjectRepository(DomainEventLog)
    private readonly eventLogRepository: Repository<DomainEventLog>,
  ) {}

  async insertEvent(event: PersistedEvent) {
    const existing = await this.eventLogRepository.exists({
      where: { eventId: event.eventId },
    });

    if (existing) {
      return;
    }

    await this.eventLogRepository.save(
      this.eventLogRepository.create({
        eventId: event.eventId,
        eventName: event.eventName,
        topic: event.topic,
        sourceService: event.sourceService,
        payload: event.payload,
        occurredAt: new Date(event.occurredAt),
      }),
    );
  }

  async insertAnalyticsSnapshot(payload: Record<string, unknown>) {
    await this.insertEvent({
      eventId: `analytics-${Date.now()}`,
      eventName: 'DashboardAnalyticsSnapshot',
      topic: 'dashboard.analytics',
      sourceService: 'admin-dashboard',
      payload,
      occurredAt: new Date(),
    });
  }
}
