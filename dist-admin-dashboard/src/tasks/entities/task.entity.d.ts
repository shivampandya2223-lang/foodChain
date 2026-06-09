import { TaskStatus } from '../../common/enums/task-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
export declare class Task extends BaseEntity {
    title: string;
    description?: string;
    status: TaskStatus;
    dueAt?: Date;
    shop: Shop;
    assignedTo?: User;
}
