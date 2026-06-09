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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const role_entity_1 = require("../../roles/entities/role.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
let User = class User extends base_entity_1.BaseEntity {
    email;
    passwordHash;
    firstName;
    lastName;
    phone;
    isActive;
    roles;
    shops;
    createdBy;
    createdUsers;
    ownedShops;
    ordersHandled;
    tasks;
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.users, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'user_roles',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => shop_entity_1.Shop, (shop) => shop.users),
    (0, typeorm_1.JoinTable)({
        name: 'user_shops',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'shopId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], User.prototype, "shops", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User, (user) => user.createdUsers, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", User)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User, (user) => user.createdBy),
    __metadata("design:type", Array)
], User.prototype, "createdUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shop_entity_1.Shop, (shop) => shop.owner),
    __metadata("design:type", Array)
], User.prototype, "ownedShops", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.employee),
    __metadata("design:type", Array)
], User.prototype, "ordersHandled", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.assignedTo),
    __metadata("design:type", Array)
], User.prototype, "tasks", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map