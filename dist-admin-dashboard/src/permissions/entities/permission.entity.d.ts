import { PermissionType } from '../../common/enums/role.enum';
import { BaseEntity } from '../../database/base.entity';
import { Role } from '../../roles/entities/role.entity';
export declare class Permission extends BaseEntity {
    name: PermissionType;
    description?: string;
    roles: Role[];
}
