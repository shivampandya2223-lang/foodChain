import { randomUUID } from 'crypto';
import { DomainEvent } from '../contracts/events/domain-event.type';

export function createDomainEvent<TPayload extends Record<string, unknown>>(
  eventName: string,
  payload: TPayload,
): DomainEvent<TPayload> {
  return {
    eventId: randomUUID(),
    eventName,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
