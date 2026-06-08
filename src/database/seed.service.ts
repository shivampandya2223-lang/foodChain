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
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { DeviceType } from '../common/enums/device-type.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { Device } from '../devices/entities/device.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { MenuRecipeItem } from '../menu/entities/menu-recipe-item.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Product } from '../products/entities/product.entity';
import { Role } from '../roles/entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Task } from '../tasks/entities/task.entity';
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
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
    @InjectRepository(MenuRecipeItem)
    private readonly recipeItemsRepository: Repository<MenuRecipeItem>,
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async run() {
    const permissions = await this.seedPermissions();
    const roles = await this.seedRoles(permissions);
    const superAdmin = await this.seedSuperAdmin(
      roles.get(RoleType.SUPER_ADMIN),
    );
    const shop = await this.seedShop(superAdmin);
    const products = await this.seedProducts(shop);
    const menuItem = await this.seedMenu(shop, products);
    const devices = await this.seedDevices(shop);
    const tasks = await this.seedTasks(shop, superAdmin);

    return {
      permissions: permissions.size,
      roles: roles.size,
      superAdmin: superAdmin.email,
      shop: shop.slug,
      products: products.length,
      menuItem: menuItem.name,
      devices: devices.length,
      tasks: tasks.length,
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
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async seedProducts(shop: Shop) {
    const productsToSeed = [
      {
        name: 'Cheese',
        sku: 'CHEESE-001',
        price: '120.00',
        quantity: '50.000',
      },
      {
        name: 'Tomato Sauce',
        sku: 'SAUCE-001',
        price: '80.00',
        quantity: '40.000',
      },
      { name: 'Dough', sku: 'DOUGH-001', price: '30.00', quantity: '100.000' },
      {
        name: 'Paneer',
        sku: 'PANEER-001',
        price: '160.00',
        quantity: '30.000',
      },
      { name: 'Onion', sku: 'ONION-001', price: '40.00', quantity: '60.000' },
      {
        name: 'Capsicum',
        sku: 'CAPSICUM-001',
        price: '55.00',
        quantity: '45.000',
      },
      {
        name: 'Coke Can',
        sku: 'COKE-001',
        price: '40.00',
        quantity: '100.000',
      },
    ];

    const products: Product[] = [];

    for (const productToSeed of productsToSeed) {
      let product = await this.productsRepository.findOne({
        where: { sku: productToSeed.sku },
        relations: { shop: true, inventoryItem: true },
      });

      if (!product) {
        product = await this.productsRepository.save(
          this.productsRepository.create({
            name: productToSeed.name,
            sku: productToSeed.sku,
            price: productToSeed.price,
            shop,
          }),
        );
      }

      if (!product.inventoryItem) {
        await this.inventoryItemsRepository.save(
          this.inventoryItemsRepository.create({
            shop,
            product,
            quantity: productToSeed.quantity,
            reorderLevel: '5.000',
          }),
        );
      }

      products.push(product);
    }

    return products;
  }

  private async seedMenu(shop: Shop, products: Product[]) {
    const productsBySku = new Map(
      products.map((product) => [product.sku, product]),
    );
    let menuItem = await this.menuItemsRepository.findOne({
      where: { name: 'Margherita Pizza' },
      relations: { shop: true, recipeItems: true },
    });

    if (!menuItem) {
      menuItem = await this.menuItemsRepository.save(
        this.menuItemsRepository.create({
          name: 'Margherita Pizza',
          description:
            'Classic pizza made with dough, cheese, and tomato sauce',
          price: '249.00',
          shop,
        }),
      );
    }

    if (!menuItem.recipeItems?.length) {
      const recipeItems = [
        { sku: 'DOUGH-001', quantity: '1.000', unit: 'piece' },
        { sku: 'CHEESE-001', quantity: '0.150', unit: 'kg' },
        { sku: 'SAUCE-001', quantity: '0.080', unit: 'kg' },
      ]
        .map((recipeItem) => {
          const product = productsBySku.get(recipeItem.sku);

          if (!product) {
            return undefined;
          }

          return this.recipeItemsRepository.create({
            menuItem,
            product,
            quantity: recipeItem.quantity,
            unit: recipeItem.unit,
          });
        })
        .filter((recipeItem): recipeItem is MenuRecipeItem =>
          Boolean(recipeItem),
        );

      await this.recipeItemsRepository.save(recipeItems);
    }

    return menuItem;
  }

  private async seedDevices(shop: Shop) {
    const devicesToSeed = [
      {
        name: 'Order Device',
        type: DeviceType.ORDER_DEVICE,
        deviceKey: 'demo-order-device',
      },
      {
        name: 'Stock Device',
        type: DeviceType.STOCK_DEVICE,
        deviceKey: 'demo-stock-device',
      },
    ];

    const devices: Device[] = [];

    for (const deviceToSeed of devicesToSeed) {
      let device = await this.devicesRepository.findOne({
        where: { deviceKey: deviceToSeed.deviceKey },
      });

      if (!device) {
        device = await this.devicesRepository.save(
          this.devicesRepository.create({
            ...deviceToSeed,
            shop,
          }),
        );
      }

      devices.push(device);
    }

    return devices;
  }

  private async seedTasks(shop: Shop, assignedTo: User) {
    const tasksToSeed = [
      'Refill Cheese Stock',
      'Clean Kitchen',
      'Check Freezer Temperature',
    ];
    const tasks: Task[] = [];

    for (const title of tasksToSeed) {
      let task = await this.tasksRepository.findOne({ where: { title } });

      if (!task) {
        task = await this.tasksRepository.save(
          this.tasksRepository.create({
            title,
            status: TaskStatus.TODO,
            shop,
            assignedTo,
          }),
        );
      }

      tasks.push(task);
    }

    return tasks;
  }
}
