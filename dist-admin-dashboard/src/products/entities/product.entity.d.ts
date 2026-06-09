import { BaseEntity } from '../../database/base.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { MenuRecipeItem } from '../../menu/entities/menu-recipe-item.entity';
import { Shop } from '../../shops/entities/shop.entity';
export declare class Product extends BaseEntity {
    name: string;
    sku: string;
    description?: string;
    price: string;
    isActive: boolean;
    shop: Shop;
    inventoryItem?: InventoryItem;
    menuRecipeItems: MenuRecipeItem[];
}
