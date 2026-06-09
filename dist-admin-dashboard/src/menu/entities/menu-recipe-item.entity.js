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
exports.MenuRecipeItem = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const menu_item_entity_1 = require("./menu-item.entity");
let MenuRecipeItem = class MenuRecipeItem extends base_entity_1.BaseEntity {
    quantity;
    unit;
    menuItem;
    product;
};
exports.MenuRecipeItem = MenuRecipeItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", String)
], MenuRecipeItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'unit' }),
    __metadata("design:type", String)
], MenuRecipeItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => menu_item_entity_1.MenuItem, (menuItem) => menuItem.recipeItems, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", menu_item_entity_1.MenuItem)
], MenuRecipeItem.prototype, "menuItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.menuRecipeItems, {
        onDelete: 'RESTRICT',
    }),
    __metadata("design:type", product_entity_1.Product)
], MenuRecipeItem.prototype, "product", void 0);
exports.MenuRecipeItem = MenuRecipeItem = __decorate([
    (0, typeorm_1.Entity)('menu_recipe_items')
], MenuRecipeItem);
//# sourceMappingURL=menu-recipe-item.entity.js.map