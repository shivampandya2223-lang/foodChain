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
exports.InventoryTransaction = void 0;
const typeorm_1 = require("typeorm");
const inventory_transaction_type_enum_1 = require("../../common/enums/inventory-transaction-type.enum");
const inventory_transaction_source_enum_1 = require("../../common/enums/inventory-transaction-source.enum");
const base_entity_1 = require("../../database/base.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const inventory_item_entity_1 = require("./inventory-item.entity");
let InventoryTransaction = class InventoryTransaction extends base_entity_1.BaseEntity {
    type;
    quantity;
    quantityBefore;
    quantityAfter;
    reason;
    source;
    referenceId;
    shop;
    inventoryItem;
    createdBy;
};
exports.InventoryTransaction = InventoryTransaction;
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: inventory_transaction_type_enum_1.InventoryTransactionType }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "quantityBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 3 }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "quantityAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: inventory_transaction_source_enum_1.InventoryTransactionSource.MANUAL }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InventoryTransaction.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { onDelete: 'CASCADE' }),
    __metadata("design:type", shop_entity_1.Shop)
], InventoryTransaction.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_item_entity_1.InventoryItem, (inventoryItem) => inventoryItem.transactions, { onDelete: 'CASCADE' }),
    __metadata("design:type", inventory_item_entity_1.InventoryItem)
], InventoryTransaction.prototype, "inventoryItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], InventoryTransaction.prototype, "createdBy", void 0);
exports.InventoryTransaction = InventoryTransaction = __decorate([
    (0, typeorm_1.Entity)('inventory_transactions')
], InventoryTransaction);
//# sourceMappingURL=inventory-transaction.entity.js.map