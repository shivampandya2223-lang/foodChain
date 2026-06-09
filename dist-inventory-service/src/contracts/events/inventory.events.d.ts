import { InventoryTransactionSource } from '../../common/enums/inventory-transaction-source.enum';
import { InventoryTransactionType } from '../../common/enums/inventory-transaction-type.enum';
import { DomainEvent } from './domain-event.type';
export type InventoryChangedEvent = DomainEvent<{
    inventoryItemId: string;
    productId: string;
    shopId: string;
    type: InventoryTransactionType;
    source: InventoryTransactionSource;
    referenceId?: string;
    quantity: string;
    quantityBefore: string;
    quantityAfter: string;
}>;
