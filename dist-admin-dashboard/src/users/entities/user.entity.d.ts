import { BaseEntity } from '../../database/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { Role } from '../../roles/entities/role.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    roles: Role[];
    shops: Shop[];
    createdBy?: User;
    createdUsers: User[];
    ownedShops: Shop[];
    ordersHandled: Order[];
    tasks: Task[];
}
