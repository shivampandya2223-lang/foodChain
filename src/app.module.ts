import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { getEnvFilePaths } from './config/env-file-paths';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { DevicesModule } from './devices/devices.module';
import { EventsModule } from './events/events.module';
import { InventoryModule } from './inventory/inventory.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductsModule } from './products/products.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';
import { ShopsModule } from './shops/shops.module';
import { StorageModule } from './storage/storage.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths('api-gateway'),
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    StorageModule,
    EventsModule,
    DevicesModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ShopsModule,
    SubscriptionsModule,
    ProductsModule,
    InventoryModule,
    MenuModule,
    OrdersModule,
    TasksModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
