import { DomainEvent } from '../contracts/events/domain-event.type';
export declare function createDomainEvent<TPayload extends Record<string, unknown>>(eventName: string, payload: TPayload): DomainEvent<TPayload>;
