import { BaseEntity } from '../../database/base.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from './order.entity';
export declare class OrderItem extends BaseEntity {
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    order: Order;
    menuItem?: MenuItem;
}
