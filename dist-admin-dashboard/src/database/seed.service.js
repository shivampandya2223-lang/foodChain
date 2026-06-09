"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const role_enum_1 = require("../common/enums/role.enum");
const inventory_item_entity_1 = require("../inventory/entities/inventory-item.entity");
const device_type_enum_1 = require("../common/enums/device-type.enum");
const task_status_enum_1 = require("../common/enums/task-status.enum");
const device_entity_1 = require("../devices/entities/device.entity");
const menu_item_entity_1 = require("../menu/entities/menu-item.entity");
const menu_recipe_item_entity_1 = require("../menu/entities/menu-recipe-item.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const product_entity_1 = require("../products/entities/product.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SeedService = class SeedService {
    configService;
    permissionsRepository;
    rolesRepository;
    usersRepository;
    shopsRepository;
    productsRepository;
    inventoryItemsRepository;
    menuItemsRepository;
    recipeItemsRepository;
    devicesRepository;
    tasksRepository;
    constructor(configService, permissionsRepository, rolesRepository, usersRepository, shopsRepository, productsRepository, inventoryItemsRepository, menuItemsRepository, recipeItemsRepository, devicesRepository, tasksRepository) {
        this.configService = configService;
        this.permissionsRepository = permissionsRepository;
        this.rolesRepository = rolesRepository;
        this.usersRepository = usersRepository;
        this.shopsRepository = shopsRepository;
        this.productsRepository = productsRepository;
        this.inventoryItemsRepository = inventoryItemsRepository;
        this.menuItemsRepository = menuItemsRepository;
        this.recipeItemsRepository = recipeItemsRepository;
        this.devicesRepository = devicesRepository;
        this.tasksRepository = tasksRepository;
    }
    async run() {
        const permissions = await this.seedPermissions();
        const roles = await this.seedRoles(permissions);
        const superAdmin = await this.seedSuperAdmin(roles.get(role_enum_1.RoleType.SUPER_ADMIN));
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
    async seedPermissions() {
        const permissions = new Map();
        for (const permissionName of Object.values(role_enum_1.PermissionType)) {
            let permission = await this.permissionsRepository.findOne({
                where: { name: permissionName },
            });
            if (!permission) {
                permission = await this.permissionsRepository.save(this.permissionsRepository.create({
                    name: permissionName,
                    description: this.humanize(permissionName),
                }));
            }
            permissions.set(permissionName, permission);
        }
        return permissions;
    }
    async seedRoles(permissions) {
        const roles = new Map();
        for (const roleName of Object.values(role_enum_1.RoleType)) {
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
            role.permissions = role_enum_1.RolePermissions[roleName]
                .map((permissionName) => permissions.get(permissionName))
                .filter((permission) => Boolean(permission));
            roles.set(roleName, await this.rolesRepository.save(role));
        }
        return roles;
    }
    async seedSuperAdmin(superAdminRole) {
        if (!superAdminRole) {
            throw new Error('Super Admin role was not seeded');
        }
        const email = this.configService
            .getOrThrow('SEED_SUPER_ADMIN_EMAIL')
            .toLowerCase()
            .trim();
        let user = await this.usersRepository.findOne({
            where: { email },
            relations: { roles: true },
        });
        if (!user) {
            user = this.usersRepository.create({
                email,
                passwordHash: await bcrypt.hash(this.configService.getOrThrow('SEED_SUPER_ADMIN_PASSWORD'), 10),
                firstName: 'Super',
                lastName: 'Admin',
                roles: [superAdminRole],
            });
        }
        else if (!user.roles?.some((role) => role.name === role_enum_1.RoleType.SUPER_ADMIN)) {
            user.roles = [...(user.roles ?? []), superAdminRole];
        }
        return this.usersRepository.save(user);
    }
    async seedShop(superAdmin) {
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
        }
        else if (!shop.users?.some((user) => user.id === superAdmin.id)) {
            shop.users = [...(shop.users ?? []), superAdmin];
        }
        return this.shopsRepository.save(shop);
    }
    humanize(value) {
        return value
            .toLowerCase()
            .split(/[._]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    async seedProducts(shop) {
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
        const products = [];
        for (const productToSeed of productsToSeed) {
            let product = await this.productsRepository.findOne({
                where: { sku: productToSeed.sku },
                relations: { shop: true, inventoryItem: true },
            });
            if (!product) {
                product = await this.productsRepository.save(this.productsRepository.create({
                    name: productToSeed.name,
                    sku: productToSeed.sku,
                    price: productToSeed.price,
                    shop,
                }));
            }
            if (!product.inventoryItem) {
                await this.inventoryItemsRepository.save(this.inventoryItemsRepository.create({
                    shop,
                    product,
                    quantity: productToSeed.quantity,
                    reorderLevel: '5.000',
                }));
            }
            products.push(product);
        }
        return products;
    }
    async seedMenu(shop, products) {
        const productsBySku = new Map(products.map((product) => [product.sku, product]));
        let menuItem = await this.menuItemsRepository.findOne({
            where: { name: 'Margherita Pizza' },
            relations: { shop: true, recipeItems: true },
        });
        if (!menuItem) {
            menuItem = await this.menuItemsRepository.save(this.menuItemsRepository.create({
                name: 'Margherita Pizza',
                description: 'Classic pizza made with dough, cheese, and tomato sauce',
                price: '249.00',
                shop,
            }));
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
                .filter((recipeItem) => Boolean(recipeItem));
            await this.recipeItemsRepository.save(recipeItems);
        }
        return menuItem;
    }
    async seedDevices(shop) {
        const devicesToSeed = [
            {
                name: 'Order Device',
                type: device_type_enum_1.DeviceType.ORDER_DEVICE,
                deviceKey: 'demo-order-device',
            },
            {
                name: 'Stock Device',
                type: device_type_enum_1.DeviceType.STOCK_DEVICE,
                deviceKey: 'demo-stock-device',
            },
        ];
        const devices = [];
        for (const deviceToSeed of devicesToSeed) {
            let device = await this.devicesRepository.findOne({
                where: { deviceKey: deviceToSeed.deviceKey },
            });
            if (!device) {
                device = await this.devicesRepository.save(this.devicesRepository.create({
                    ...deviceToSeed,
                    shop,
                }));
            }
            devices.push(device);
        }
        return devices;
    }
    async seedTasks(shop, assignedTo) {
        const tasksToSeed = [
            'Refill Cheese Stock',
            'Clean Kitchen',
            'Check Freezer Temperature',
        ];
        const tasks = [];
        for (const title of tasksToSeed) {
            let task = await this.tasksRepository.findOne({ where: { title } });
            if (!task) {
                task = await this.tasksRepository.save(this.tasksRepository.create({
                    title,
                    status: task_status_enum_1.TaskStatus.TODO,
                    shop,
                    assignedTo,
                }));
            }
            tasks.push(task);
        }
        return tasks;
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(5, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(6, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __param(7, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __param(8, (0, typeorm_1.InjectRepository)(menu_recipe_item_entity_1.MenuRecipeItem)),
    __param(9, (0, typeorm_1.InjectRepository)(device_entity_1.Device)),
    __param(10, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map