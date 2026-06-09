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
var AdminDashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafka_topic_enum_1 = require("../../../src/common/enums/kafka-topic.enum");
const kafka_client_factory_1 = require("../../../src/kafka/kafka-client.factory");
const mongo_event_store_service_1 = require("../../../src/storage/mongo-event-store.service");
const postgres_event_store_service_1 = require("../../../src/storage/postgres-event-store.service");
const redis_cache_service_1 = require("../../../src/storage/redis-cache.service");
const dashboard_live_data_1 = require("./dashboard-live-data");
let AdminDashboardService = AdminDashboardService_1 = class AdminDashboardService {
    configService;
    redisCache;
    mongoEventStore;
    postgresEventStore;
    logger = new common_1.Logger(AdminDashboardService_1.name);
    topics = Object.values(kafka_topic_enum_1.KafkaTopic);
    recentEvents = [];
    consumedByTopic = {};
    transactions = [
        ...dashboard_live_data_1.dashboardTransactions,
    ];
    analytics = (0, dashboard_live_data_1.createDashboardEventAnalytics)();
    clients = new Set();
    consumer;
    demoEventTimer;
    connected = false;
    lastError;
    constructor(configService, redisCache, mongoEventStore, postgresEventStore) {
        this.configService = configService;
        this.redisCache = redisCache;
        this.mongoEventStore = mongoEventStore;
        this.postgresEventStore = postgresEventStore;
    }
    async onModuleInit() {
        if (!this.isKafkaEnabled()) {
            this.hydrateDemoData();
            this.startDemoEventStream();
            this.logger.log('Kafka dashboard consumer disabled');
            return;
        }
        const kafka = (0, kafka_client_factory_1.createKafkaClient)(this.configService, 'food-chain-admin-dashboard');
        const consumer = kafka.consumer({
            groupId: this.configService.get('KAFKA_ADMIN_DASHBOARD_GROUP_ID', 'food-chain-admin-dashboard'),
        });
        this.consumer = consumer;
        try {
            await consumer.connect();
            this.connected = true;
        }
        catch (error) {
            this.connected = false;
            this.lastError = error instanceof Error ? error.message : String(error);
            throw error;
        }
        for (const topic of this.topics) {
            await consumer.subscribe({ topic, fromBeginning: false });
        }
        await consumer.run({
            eachMessage: (payload) => Promise.resolve(this.handleMessage(payload)),
        });
    }
    async onApplicationShutdown() {
        for (const client of this.clients) {
            client.end();
        }
        if (this.consumer) {
            await this.consumer.disconnect();
            this.connected = false;
        }
        if (this.demoEventTimer) {
            clearInterval(this.demoEventTimer);
        }
    }
    addClient(response) {
        this.clients.add(response);
        this.writeSse(response, 'snapshot', {
            status: this.getKafkaStatus(),
            recentEvents: this.recentEvents,
            transactions: this.transactions,
            business: dashboard_live_data_1.dashboardBusinessSnapshot,
            analytics: this.analytics,
            storage: this.getStorageStatus(),
            persistence: this.getPersistenceStatus(),
        });
        response.on('close', () => {
            this.clients.delete(response);
        });
    }
    getKafkaStatus() {
        return {
            enabled: this.isKafkaEnabled(),
            connected: this.connected,
            brokers: (0, kafka_client_factory_1.getKafkaBrokers)(this.configService),
            groupId: this.configService.get('KAFKA_ADMIN_DASHBOARD_GROUP_ID', 'food-chain-admin-dashboard'),
            topics: this.topics,
            consumedByTopic: this.consumedByTopic,
            recentEventCount: this.recentEvents.length,
            lastError: this.lastError,
        };
    }
    async getSummary() {
        return {
            kafka: this.getKafkaStatus(),
            services: await this.getServiceStatuses(),
            modules: [
                'Auth',
                'Users',
                'Roles & Permissions',
                'Shops',
                'Products',
                'Inventory',
                'Menu',
                'Orders',
                'Tasks',
                'Devices',
            ],
            roleHierarchy: ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'EMPLOYEE'],
            recentEvents: this.recentEvents,
            transactions: this.transactions,
            business: dashboard_live_data_1.dashboardBusinessSnapshot,
            analytics: this.analytics,
            storage: this.getStorageStatus(),
            persistence: this.getPersistenceStatus(),
        };
    }
    getStorageStatus() {
        return {
            redis: this.redisCache.getStatus(),
            mongo: this.mongoEventStore.getStatus(),
            postgres: {
                enabled: true,
                host: this.configService.get('DB_HOST'),
                database: this.configService.get('DB_NAME'),
            },
        };
    }
    getPersistenceStatus() {
        return {
            mode: this.isKafkaEnabled() ? 'kafka' : 'demo-loader',
            demoPersistenceEnabled: this.isDemoPersistenceEnabled(),
            databaseWritesActive: this.isKafkaEnabled() || this.isDemoPersistenceEnabled(),
            message: this.isKafkaEnabled() || this.isDemoPersistenceEnabled()
                ? 'Events are being persisted to configured data stores.'
                : 'Demo loader is active; database writes wait for Kafka events.',
        };
    }
    handleMessage({ topic, message }) {
        if (!message.value) {
            return;
        }
        const event = JSON.parse(message.value.toString());
        const dashboardEvent = {
            ...event,
            topic: topic,
        };
        this.recordDashboardEvent(dashboardEvent, true, 'kafka');
    }
    hydrateDemoData() {
        this.hydrateAnalyticsCounters();
        for (const event of [...dashboard_live_data_1.dashboardSeedEvents].reverse()) {
            this.recordDashboardEvent(event, false, 'demo');
        }
    }
    startDemoEventStream() {
        this.demoEventTimer = setInterval(() => {
            const event = (0, dashboard_live_data_1.getNextLiveDashboardEvent)();
            this.recordAnalyticsBatch((0, dashboard_live_data_1.getNextAnalyticsBatch)(), 'demo');
            this.recordDashboardEvent(event, true, 'demo');
            this.broadcast('dashboard-analytics', this.analytics);
        }, 4500);
    }
    hydrateAnalyticsCounters() {
        for (const [topic, count] of Object.entries(this.analytics.byTopic)) {
            this.consumedByTopic[topic] = count;
        }
    }
    recordDashboardEvent(dashboardEvent, shouldBroadcast, source) {
        this.consumedByTopic[dashboardEvent.topic] =
            (this.consumedByTopic[dashboardEvent.topic] ?? 0) + 1;
        this.analytics.totalEvents += 1;
        this.analytics.byTopic[dashboardEvent.topic] =
            (this.analytics.byTopic[dashboardEvent.topic] ?? 0) + 1;
        this.analytics.eventsPerMinute += 1;
        this.recentEvents.unshift(dashboardEvent);
        this.recentEvents.splice(100);
        this.captureTransaction(dashboardEvent);
        if (this.shouldPersist(source)) {
            this.persistDashboardEvent(dashboardEvent);
        }
        if (!shouldBroadcast) {
            return;
        }
        this.broadcast('kafka-event', dashboardEvent);
        this.broadcast('dashboard-transactions', this.transactions);
        this.broadcast('dashboard-analytics', this.analytics);
        this.broadcast('kafka-status', this.getKafkaStatus());
    }
    recordAnalyticsBatch(batch, source) {
        this.consumedByTopic[batch.topic] =
            (this.consumedByTopic[batch.topic] ?? 0) + batch.count;
        this.analytics.byTopic[batch.topic] =
            (this.analytics.byTopic[batch.topic] ?? 0) + batch.count;
        this.analytics.byService[batch.serviceName] =
            (this.analytics.byService[batch.serviceName] ?? 0) + batch.count;
        this.analytics.eventTasksByService[batch.serviceName] =
            (this.analytics.eventTasksByService[batch.serviceName] ?? 0) +
                batch.taskCount;
        this.analytics.totalEvents += batch.count;
        this.analytics.eventsPerMinute = batch.count;
        this.analytics.peakEventsPerMinute = Math.max(this.analytics.peakEventsPerMinute, batch.count);
        const lastBucket = this.analytics.timeline[this.analytics.timeline.length - 1];
        lastBucket.count += batch.timelineCount;
        if (this.shouldPersist(source)) {
            this.persistAnalyticsBatch(batch);
        }
    }
    captureTransaction(event) {
        const payload = event.payload;
        const referenceId = this.toDisplayString(payload.orderId ??
            payload.transactionId ??
            payload.taskId ??
            payload.shopId ??
            payload.userId ??
            event.eventId);
        const shop = this.toDisplayString(payload.shopName ?? payload.shopId ?? payload.shop ?? 'Food Chain HQ');
        const transaction = {
            id: `live-${event.eventId}`,
            type: this.getTransactionType(event.topic),
            title: event.eventName,
            shop,
            amount: typeof payload.totalAmount === 'number'
                ? payload.totalAmount
                : undefined,
            status: this.toDisplayString(payload.nextStatus ??
                payload.status ??
                payload.source ??
                event.eventName),
            source: this.toDisplayString(payload.source ?? payload.channel ?? 'KAFKA'),
            referenceId,
            occurredAt: event.occurredAt,
        };
        this.transactions.unshift(transaction);
        this.transactions.splice(40);
    }
    persistDashboardEvent(event) {
        void this.redisCache.incrementHashBy('food-chain:dashboard:topic-counters', event.topic, 1);
        void this.redisCache.setJson('food-chain:dashboard:analytics', this.analytics, 60);
        void this.redisCache.setJson('food-chain:dashboard:recent-events', this.recentEvents, 60);
        void this.mongoEventStore.insertEvent({
            ...event,
            sourceService: 'admin-dashboard',
        });
        void this.postgresEventStore.insertEvent({
            eventId: event.eventId,
            eventName: event.eventName,
            topic: event.topic,
            sourceService: 'admin-dashboard',
            payload: event.payload,
            occurredAt: event.occurredAt,
        });
    }
    persistAnalyticsBatch(batch) {
        const payload = {
            batch,
            analytics: this.analytics,
            counters: this.consumedByTopic,
        };
        void this.redisCache.incrementHashBy('food-chain:dashboard:service-load', batch.serviceName, batch.count);
        void this.redisCache.setJson('food-chain:dashboard:analytics', this.analytics, 60);
        void this.mongoEventStore.insertEvent({
            eventId: `analytics-${Date.now()}-${batch.topic}`,
            eventName: 'DashboardAnalyticsSnapshot',
            topic: 'dashboard.analytics',
            sourceService: 'admin-dashboard',
            payload,
            occurredAt: new Date().toISOString(),
        });
        void this.postgresEventStore.insertAnalyticsSnapshot(payload);
    }
    shouldPersist(source) {
        return source === 'kafka' || this.isDemoPersistenceEnabled();
    }
    getTransactionType(topic) {
        if (topic.startsWith('order.')) {
            return 'ORDER';
        }
        if (topic.startsWith('inventory.')) {
            return 'INVENTORY';
        }
        if (topic.startsWith('task.')) {
            return 'TASK';
        }
        if (topic === kafka_topic_enum_1.KafkaTopic.SHOP_CREATED) {
            return 'SHOP';
        }
        return 'USER';
    }
    toDisplayString(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        if (value === null || value === undefined) {
            return '';
        }
        return JSON.stringify(value);
    }
    async getServiceStatuses() {
        const services = [
            {
                name: 'Core API',
                url: `http://localhost:${this.configService.get('PORT') ?? 1304}`,
                healthPath: '/',
            },
            {
                name: 'Inventory Service',
                url: `http://localhost:${this.configService.get('INVENTORY_SERVICE_PORT') ?? 1306}`,
                healthPath: '/health',
            },
            {
                name: 'Notification Service',
                url: `http://localhost:${this.configService.get('NOTIFICATION_SERVICE_PORT') ?? 1307}`,
                healthPath: '/health',
            },
            {
                name: 'Analytics Service',
                url: `http://localhost:${this.configService.get('ANALYTICS_SERVICE_PORT') ?? 1308}`,
                healthPath: '/health',
            },
        ];
        return Promise.all(services.map(async (service) => {
            try {
                const response = await fetch(`${service.url}${service.healthPath}`, {
                    signal: AbortSignal.timeout(1000),
                });
                const detail = await response.json().catch(() => undefined);
                return {
                    ...service,
                    healthy: response.ok,
                    detail,
                };
            }
            catch (error) {
                return {
                    ...service,
                    healthy: false,
                    detail: error instanceof Error ? error.message : String(error),
                };
            }
        }));
    }
    broadcast(eventName, payload) {
        for (const client of this.clients) {
            this.writeSse(client, eventName, payload);
        }
    }
    writeSse(response, eventName, payload) {
        response.write(`event: ${eventName}\n`);
        response.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
    isKafkaEnabled() {
        return this.configService.get('KAFKA_ENABLED') ?? false;
    }
    isDemoPersistenceEnabled() {
        return (this.configService.get('DASHBOARD_DEMO_PERSIST_ENABLED') ?? false);
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = AdminDashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_cache_service_1.RedisCacheService,
        mongo_event_store_service_1.MongoEventStoreService,
        postgres_event_store_service_1.PostgresEventStoreService])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map