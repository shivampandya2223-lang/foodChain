import { BaseEntity } from '../../database/base.entity';
import { Device } from '../../devices/entities/device.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
export declare class Shop extends BaseEntity {
    name: string;
    slug: string;
    address?: string;
    phone?: string;
    isActive: boolean;
    owner?: User;
    users: User[];
    subscription?: Subscription;
    products: Product[];
    menuItems: MenuItem[];
    inventoryItems: InventoryItem[];
    orders: Order[];
    tasks: Task[];
    devices: Device[];
}
