import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { MenuItem } from './menu-item.entity';
export declare class MenuRecipeItem extends BaseEntity {
    quantity: string;
    unit: string;
    menuItem: MenuItem;
    product: Product;
}
