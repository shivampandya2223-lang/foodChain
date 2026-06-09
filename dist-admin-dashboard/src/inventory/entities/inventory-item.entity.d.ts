import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { InventoryTransaction } from './inventory-transaction.entity';
export declare class InventoryItem extends BaseEntity {
    quantity: string;
    reorderLevel: string;
    shop: Shop;
    product: Product;
    transactions: InventoryTransaction[];
}
