import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  PermissionType,
  RolePermissions,
  RoleType,
} from '../common/enums/role.enum';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  async run() {
    const permissions = await this.seedPermissions();
    const roles = await this.seedRoles(permissions);
    const superAdmin = await this.seedSuperAdmin(
      roles.get(RoleType.SUPER_ADMIN),
    );
    const shop = await this.seedShop(superAdmin);

    return {
      permissions: permissions.size,
      roles: roles.size,
      superAdmin: superAdmin.email,
      shop: shop.slug,
    };
  }

  private async seedPermissions() {
    const permissions = new Map<PermissionType, Permission>();

    for (const permissionName of Object.values(PermissionType)) {
      let permission = await this.permissionsRepository.findOne({
        where: { name: permissionName },
      });

      if (!permission) {
        permission = await this.permissionsRepository.save(
          this.permissionsRepository.create({
            name: permissionName,
            description: this.humanize(permissionName),
          }),
        );
      }

      permissions.set(permissionName, permission);
    }

    return permissions;
  }

  private async seedRoles(permissions: Map<PermissionType, Permission>) {
    const roles = new Map<RoleType, Role>();

    for (const roleName of Object.values(RoleType)) {
      let role = await this.rolesRepository.findOne({
        where: { name: roleName },
        relations: { permissions: true },
      });

      if (!role) {
        role = this.rolesRepository.create({
          name: roleName,
          description: this.humanize(roleName),
        });
      }

      role.permissions = RolePermissions[roleName]
        .map((permissionName) => permissions.get(permissionName))
        .filter((permission): permission is Permission => Boolean(permission));

      roles.set(roleName, await this.rolesRepository.save(role));
    }

    return roles;
  }

  private async seedSuperAdmin(superAdminRole?: Role) {
    if (!superAdminRole) {
      throw new Error('Super Admin role was not seeded');
    }

    const email = this.configService
      .getOrThrow<string>('SEED_SUPER_ADMIN_EMAIL')
      .toLowerCase()
      .trim();

    let user = await this.usersRepository.findOne({
      where: { email },
      relations: { roles: true },
    });

    if (!user) {
      user = this.usersRepository.create({
        email,
        passwordHash: await bcrypt.hash(
          this.configService.getOrThrow<string>('SEED_SUPER_ADMIN_PASSWORD'),
          10,
        ),
        firstName: 'Super',
        lastName: 'Admin',
        roles: [superAdminRole],
      });
    } else if (
      !user.roles?.some((role) => role.name === RoleType.SUPER_ADMIN)
    ) {
      user.roles = [...(user.roles ?? []), superAdminRole];
    }

    return this.usersRepository.save(user);
  }

  private async seedShop(superAdmin: User) {
    let shop = await this.shopsRepository.findOne({
      where: { slug: 'demo-shop' },
      relations: { users: true },
    });

    if (!shop) {
      shop = this.shopsRepository.create({
        name: 'Demo Shop',
        slug: 'demo-shop',
        address: 'Local test address',
        owner: superAdmin,
        users: [superAdmin],
      });
    } else if (!shop.users?.some((user) => user.id === superAdmin.id)) {
      shop.users = [...(shop.users ?? []), superAdmin];
    }

    return this.shopsRepository.save(shop);
  }

  private humanize(value: string) {
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
