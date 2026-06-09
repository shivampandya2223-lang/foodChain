import { DomainEvent } from './domain-event.type';
export type ShopCreatedEvent = DomainEvent<{
    shopId: string;
    name: string;
    slug: string;
    ownerId?: string;
}>;
