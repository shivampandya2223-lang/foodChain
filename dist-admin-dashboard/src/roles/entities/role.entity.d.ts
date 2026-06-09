import { RoleType } from '../../common/enums/role.enum';
import { BaseEntity } from '../../database/base.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
export declare class Role extends BaseEntity {
    name: RoleType;
    description?: string;
    permissions: Permission[];
    users: User[];
}
