"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shop = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const device_entity_1 = require("../../devices/entities/device.entity");
const inventory_item_entity_1 = require("../../inventory/entities/inventory-item.entity");
const menu_item_entity_1 = require("../../menu/entities/menu-item.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const subscription_entity_1 = require("../../subscriptions/entities/subscription.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Shop = class Shop extends base_entity_1.BaseEntity {
    name;
    slug;
    address;
    phone;
    isActive;
    owner;
    users;
    subscription;
    products;
    menuItems;
    inventoryItems;
    orders;
    tasks;
    devices;
};
exports.Shop = Shop;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Shop.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Shop.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Shop.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Shop.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Shop.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ownedShops, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", user_entity_1.User)
], Shop.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, (user) => user.shops),
    __metadata("design:type", Array)
], Shop.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => subscription_entity_1.Subscription, (subscription) => subscription.shop),
    __metadata("design:type", subscription_entity_1.Subscription)
], Shop.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product.shop),
    __metadata("design:type", Array)
], Shop.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => menu_item_entity_1.MenuItem, (menuItem) => menuItem.shop),
    __metadata("design:type", Array)
], Shop.prototype, "menuItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inventory_item_entity_1.InventoryItem, (inventoryItem) => inventoryItem.shop),
    __metadata("design:type", Array)
], Shop.prototype, "inventoryItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.shop),
    __metadata("design:type", Array)
], Shop.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.shop),
    __metadata("design:type", Array)
], Shop.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => device_entity_1.Device, (device) => device.shop),
    __metadata("design:type", Array)
], Shop.prototype, "devices", void 0);
exports.Shop = Shop = __decorate([
    (0, typeorm_1.Entity)('shops')
], Shop);
//# sourceMappingURL=shop.entity.js.map