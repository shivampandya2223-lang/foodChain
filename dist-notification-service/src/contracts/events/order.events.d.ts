import { OrderStatus } from '../../common/enums/order-status.enum';
import { DomainEvent } from './domain-event.type';
export type OrderCreatedEvent = DomainEvent<{
    orderId: string;
    orderNumber: string;
    shopId: string;
    status: OrderStatus;
    totalAmount: string;
    itemCount: number;
}>;
export type OrderUpdatedEvent = DomainEvent<{
    orderId: string;
    orderNumber: string;
    shopId: string;
    previousStatus: OrderStatus;
    status: OrderStatus;
}>;
export type OrderCancelledEvent = DomainEvent<{
    orderId: string;
    orderNumber: string;
    shopId: string;
    previousStatus: OrderStatus;
    status: OrderStatus.CANCELLED;
}>;
