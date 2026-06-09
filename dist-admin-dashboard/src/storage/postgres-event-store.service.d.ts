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
export declare class PostgresEventStoreService {
    private readonly eventLogRepository;
    constructor(eventLogRepository: Repository<DomainEventLog>);
    insertEvent(event: PersistedEvent): Promise<void>;
    insertAnalyticsSnapshot(payload: Record<string, unknown>): Promise<void>;
}
export {};
