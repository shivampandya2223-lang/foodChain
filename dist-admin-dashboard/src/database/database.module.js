"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const device_entity_1 = require("../devices/entities/device.entity");
const outbox_event_entity_1 = require("../events/entities/outbox-event.entity");
const inventory_item_entity_1 = require("../inventory/entities/inventory-item.entity");
const inventory_transaction_entity_1 = require("../inventory/entities/inventory-transaction.entity");
const menu_item_entity_1 = require("../menu/entities/menu-item.entity");
const menu_recipe_item_entity_1 = require("../menu/entities/menu-recipe-item.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const product_entity_1 = require("../products/entities/product.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const domain_event_log_entity_1 = require("../storage/entities/domain-event-log.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const system_setting_entity_1 = require("../settings/entities/system-setting.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const user_entity_1 = require("../users/entities/user.entity");
const seed_service_1 = require("./seed.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    entities: [
                        user_entity_1.User,
                        role_entity_1.Role,
                        permission_entity_1.Permission,
                        shop_entity_1.Shop,
                        subscription_entity_1.Subscription,
                        product_entity_1.Product,
                        inventory_item_entity_1.InventoryItem,
                        inventory_transaction_entity_1.InventoryTransaction,
                        menu_item_entity_1.MenuItem,
                        menu_recipe_item_entity_1.MenuRecipeItem,
                        device_entity_1.Device,
                        order_entity_1.Order,
                        order_item_entity_1.OrderItem,
                        task_entity_1.Task,
                        system_setting_entity_1.SystemSetting,
                        domain_event_log_entity_1.DomainEventLog,
                        outbox_event_entity_1.OutboxEvent,
                    ],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    ...buildConnectionTarget(configService),
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                permission_entity_1.Permission,
                role_entity_1.Role,
                user_entity_1.User,
                shop_entity_1.Shop,
                product_entity_1.Product,
                inventory_item_entity_1.InventoryItem,
                menu_item_entity_1.MenuItem,
                menu_recipe_item_entity_1.MenuRecipeItem,
                device_entity_1.Device,
                task_entity_1.Task,
                domain_event_log_entity_1.DomainEventLog,
                outbox_event_entity_1.OutboxEvent,
            ]),
        ],
        providers: [seed_service_1.SeedService],
        exports: [seed_service_1.SeedService],
    })
], DatabaseModule);
function buildConnectionTarget(configService) {
    const replicaHosts = configService
        .get('DB_REPLICA_HOSTS', '')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean);
    if (!replicaHosts.length) {
        return {
            host: configService.getOrThrow('DB_HOST'),
            port: configService.getOrThrow('DB_PORT'),
            username: configService.getOrThrow('DB_USERNAME'),
            password: configService.getOrThrow('DB_PASSWORD'),
            database: configService.getOrThrow('DB_NAME'),
        };
    }
    const port = configService.getOrThrow('DB_PORT');
    const username = configService.getOrThrow('DB_USERNAME');
    const password = configService.getOrThrow('DB_PASSWORD');
    const database = configService.getOrThrow('DB_NAME');
    return {
        replication: {
            master: {
                host: configService.get('DB_PRIMARY_HOST') ||
                    configService.getOrThrow('DB_HOST'),
                port,
                username,
                password,
                database,
            },
            slaves: replicaHosts.map((host) => ({
                host,
                port,
                username,
                password,
                database,
            })),
        },
    };
}
//# sourceMappingURL=database.module.js.map