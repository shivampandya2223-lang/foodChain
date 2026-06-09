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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const inventory_item_entity_1 = require("../../inventory/entities/inventory-item.entity");
const menu_recipe_item_entity_1 = require("../../menu/entities/menu-recipe-item.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
let Product = class Product extends base_entity_1.BaseEntity {
    name;
    sku;
    description;
    price;
    isActive;
    shop;
    inventoryItem;
    menuRecipeItems;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", String)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.products, { onDelete: 'CASCADE' }),
    __metadata("design:type", shop_entity_1.Shop)
], Product.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => inventory_item_entity_1.InventoryItem, (inventoryItem) => inventoryItem.product),
    __metadata("design:type", inventory_item_entity_1.InventoryItem)
], Product.prototype, "inventoryItem", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => menu_recipe_item_entity_1.MenuRecipeItem, (recipeItem) => recipeItem.product),
    __metadata("design:type", Array)
], Product.prototype, "menuRecipeItems", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Index)(['shop', 'sku'], { unique: true })
], Product);
//# sourceMappingURL=product.entity.js.map