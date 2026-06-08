import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../devices/entities/device.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { MenuRecipeItem } from '../menu/entities/menu-recipe-item.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Product } from '../products/entities/product.entity';
import { Role } from '../roles/entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SystemSetting } from '../settings/entities/system-setting.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [
          User,
          Role,
          Permission,
          Shop,
          Subscription,
          Product,
          InventoryItem,
          InventoryTransaction,
          MenuItem,
          MenuRecipeItem,
          Device,
          Order,
          OrderItem,
          Task,
          SystemSetting,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([
      Permission,
      Role,
      User,
      Shop,
      Product,
      InventoryItem,
      MenuItem,
      MenuRecipeItem,
      Device,
      Task,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
