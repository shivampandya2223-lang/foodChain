export type DomainEvent<TPayload extends Record<string, unknown>> = {
    eventId: string;
    eventName: string;
    occurredAt: string;
    payload: TPayload;
};
