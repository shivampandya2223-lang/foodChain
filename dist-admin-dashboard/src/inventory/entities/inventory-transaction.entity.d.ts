import { InventoryTransactionType } from '../../common/enums/inventory-transaction-type.enum';
import { InventoryTransactionSource } from '../../common/enums/inventory-transaction-source.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { InventoryItem } from './inventory-item.entity';
export declare class InventoryTransaction extends BaseEntity {
    type: InventoryTransactionType;
    quantity: string;
    quantityBefore: string;
    quantityAfter: string;
    reason?: string;
    source: InventoryTransactionSource;
    referenceId?: string;
    shop: Shop;
    inventoryItem: InventoryItem;
    createdBy?: User;
}
