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
exports.DomainEventLog = void 0;
const typeorm_1 = require("typeorm");
let DomainEventLog = class DomainEventLog {
    id;
    eventId;
    topic;
    eventName;
    sourceService;
    payload;
    occurredAt;
    storedAt;
};
exports.DomainEventLog = DomainEventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DomainEventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DomainEventLog.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DomainEventLog.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DomainEventLog.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'unknown' }),
    __metadata("design:type", String)
], DomainEventLog.prototype, "sourceService", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DomainEventLog.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], DomainEventLog.prototype, "occurredAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], DomainEventLog.prototype, "storedAt", void 0);
exports.DomainEventLog = DomainEventLog = __decorate([
    (0, typeorm_1.Entity)('domain_event_logs')
], DomainEventLog);
//# sourceMappingURL=domain-event-log.entity.js.map