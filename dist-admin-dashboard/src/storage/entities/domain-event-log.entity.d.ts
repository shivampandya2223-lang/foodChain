export declare class DomainEventLog {
    id: string;
    eventId: string;
    topic?: string;
    eventName: string;
    sourceService: string;
    payload: Record<string, unknown>;
    occurredAt: Date;
    storedAt: Date;
}
