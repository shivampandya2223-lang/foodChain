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
    await this.eventLogRepository
      .createQueryBuilder()
      .insert()
      .into(DomainEventLog)
      .values({
        eventId: event.eventId,
        eventName: event.eventName,
        topic: event.topic,
        sourceService: event.sourceService,
        payload: event.payload as never,
        occurredAt: new Date(event.occurredAt),
      })
      .orIgnore()
      .execute();
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
