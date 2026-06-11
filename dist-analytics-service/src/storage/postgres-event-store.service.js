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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresEventStoreService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const domain_event_log_entity_1 = require("./entities/domain-event-log.entity");
let PostgresEventStoreService = class PostgresEventStoreService {
    eventLogRepository;
    constructor(eventLogRepository) {
        this.eventLogRepository = eventLogRepository;
    }
    async insertEvent(event) {
        await this.eventLogRepository
            .createQueryBuilder()
            .insert()
            .into(domain_event_log_entity_1.DomainEventLog)
            .values({
            eventId: event.eventId,
            eventName: event.eventName,
            topic: event.topic,
            sourceService: event.sourceService,
            payload: event.payload,
            occurredAt: new Date(event.occurredAt),
        })
            .orIgnore()
            .execute();
    }
    async insertAnalyticsSnapshot(payload) {
        await this.insertEvent({
            eventId: `analytics-${Date.now()}`,
            eventName: 'DashboardAnalyticsSnapshot',
            topic: 'dashboard.analytics',
            sourceService: 'admin-dashboard',
            payload,
            occurredAt: new Date(),
        });
    }
};
exports.PostgresEventStoreService = PostgresEventStoreService;
exports.PostgresEventStoreService = PostgresEventStoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(domain_event_log_entity_1.DomainEventLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostgresEventStoreService);
//# sourceMappingURL=postgres-event-store.service.js.map