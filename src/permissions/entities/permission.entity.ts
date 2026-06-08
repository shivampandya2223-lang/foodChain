import { Column, Entity, ManyToMany } from 'typeorm';
import { PermissionType } from '../../common/enums/role.enum';
import { BaseEntity } from '../../database/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: PermissionType;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
