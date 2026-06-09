import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { MenuRecipeItem } from './menu-recipe-item.entity';
export declare class MenuItem extends BaseEntity {
    name: string;
    description?: string;
    price: string;
    isAvailable: boolean;
    shop: Shop;
    recipeItems: MenuRecipeItem[];
}
