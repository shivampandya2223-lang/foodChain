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
exports.Device = void 0;
const typeorm_1 = require("typeorm");
const device_type_enum_1 = require("../../common/enums/device-type.enum");
const base_entity_1 = require("../../database/base.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
let Device = class Device extends base_entity_1.BaseEntity {
    name;
    type;
    deviceKey;
    isActive;
    shop;
};
exports.Device = Device;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Device.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: device_type_enum_1.DeviceType }),
    __metadata("design:type", String)
], Device.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Device.prototype, "deviceKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Device.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.devices, { onDelete: 'CASCADE' }),
    __metadata("design:type", shop_entity_1.Shop)
], Device.prototype, "shop", void 0);
exports.Device = Device = __decorate([
    (0, typeorm_1.Entity)('devices')
], Device);
//# sourceMappingURL=device.entity.js.map