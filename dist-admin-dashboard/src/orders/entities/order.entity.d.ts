import { OrderStatus } from '../../common/enums/order-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
export declare class Order extends BaseEntity {
    orderNumber: string;
    status: OrderStatus;
    totalAmount: string;
    customerName?: string;
    customerPhone?: string;
    shop: Shop;
    employee?: User;
    items: OrderItem[];
}
