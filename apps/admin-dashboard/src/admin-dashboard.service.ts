import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaTopic } from '../../../src/common/enums/kafka-topic.enum';
import { DomainEvent } from '../../../src/contracts/events/domain-event.type';
import {
  createKafkaClient,
  getKafkaBrokers,
} from '../../../src/kafka/kafka-client.factory';
import { MongoEventStoreService } from '../../../src/storage/mongo-event-store.service';
import { PostgresEventStoreService } from '../../../src/storage/postgres-event-store.service';
import { RedisCacheService } from '../../../src/storage/redis-cache.service';
import {
  DashboardEvent,
  DashboardEventAnalytics,
  DashboardTransaction,
  createDashboardEventAnalytics,
  dashboardBusinessSnapshot,
  dashboardSeedEvents,
  dashboardTransactions,
  getNextAnalyticsBatch,
  getNextLiveDashboardEvent,
} from './dashboard-live-data';

type ServiceStatus = {
  name: string;
  url: string;
  healthy: boolean;
  detail?: unknown;
};

type DashboardEventSource = 'demo' | 'kafka';

@Injectable()
export class AdminDashboardService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(AdminDashboardService.name);
  private readonly topics = Object.values(KafkaTopic);
  private readonly recentEvents: DashboardEvent[] = [];
  private readonly consumedByTopic: Partial<Record<KafkaTopic, number>> = {};
  private readonly transactions: DashboardTransaction[] = [
    ...dashboardTransactions,
  ];
  private readonly analytics: DashboardEventAnalytics =
    createDashboardEventAnalytics();
  private readonly clients = new Set<Response>();
  private consumer?: Consumer;
  private demoEventTimer?: ReturnType<typeof setInterval>;
  private connected = false;
  private lastError?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisCache: RedisCacheService,
    private readonly mongoEventStore: MongoEventStoreService,
    private readonly postgresEventStore: PostgresEventStoreService,
  ) {}

  async onModuleInit() {
    if (!this.isKafkaEnabled()) {
      this.hydrateDemoData();
      this.startDemoEventStream();
      this.logger.log('Kafka dashboard consumer disabled');
      return;
    }

    const kafka = createKafkaClient(
      this.configService,
      'food-chain-admin-dashboard',
    );
    const consumer = kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_ADMIN_DASHBOARD_GROUP_ID',
        'food-chain-admin-dashboard',
      ),
    });
    this.consumer = consumer;

    try {
      await consumer.connect();
      this.connected = true;
    } catch (error) {
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

  addClient(response: Response) {
    this.clients.add(response);
    this.writeSse(response, 'snapshot', {
      status: this.getKafkaStatus(),
      recentEvents: this.recentEvents,
      transactions: this.transactions,
      business: dashboardBusinessSnapshot,
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
      brokers: getKafkaBrokers(this.configService),
      groupId: this.configService.get<string>(
        'KAFKA_ADMIN_DASHBOARD_GROUP_ID',
        'food-chain-admin-dashboard',
      ),
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
      business: dashboardBusinessSnapshot,
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
        host: this.configService.get<string>('DB_HOST'),
        database: this.configService.get<string>('DB_NAME'),
      },
    };
  }

  getPersistenceStatus() {
    return {
      mode: this.isKafkaEnabled() ? 'kafka' : 'demo-loader',
      demoPersistenceEnabled: this.isDemoPersistenceEnabled(),
      databaseWritesActive:
        this.isKafkaEnabled() || this.isDemoPersistenceEnabled(),
      message:
        this.isKafkaEnabled() || this.isDemoPersistenceEnabled()
          ? 'Events are being persisted to configured data stores.'
          : 'Demo loader is active; database writes wait for Kafka events.',
    };
  }

  private handleMessage({ topic, message }: EachMessagePayload) {
    if (!message.value) {
      return;
    }

    const event = JSON.parse(message.value.toString()) as DomainEvent<
      Record<string, unknown>
    >;
    const dashboardEvent: DashboardEvent = {
      ...event,
      topic: topic as KafkaTopic,
    };

    this.recordDashboardEvent(dashboardEvent, true, 'kafka');
  }

  private hydrateDemoData() {
    this.hydrateAnalyticsCounters();

    for (const event of [...dashboardSeedEvents].reverse()) {
      this.recordDashboardEvent(event, false, 'demo');
    }
  }

  private startDemoEventStream() {
    this.demoEventTimer = setInterval(() => {
      const event = getNextLiveDashboardEvent();
      this.recordAnalyticsBatch(getNextAnalyticsBatch(), 'demo');
      this.recordDashboardEvent(event, true, 'demo');
      this.broadcast('dashboard-analytics', this.analytics);
    }, 4500);
  }

  private hydrateAnalyticsCounters() {
    for (const [topic, count] of Object.entries(this.analytics.byTopic)) {
      this.consumedByTopic[topic as KafkaTopic] = count;
    }
  }

  private recordDashboardEvent(
    dashboardEvent: DashboardEvent,
    shouldBroadcast: boolean,
    source: DashboardEventSource,
  ) {
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

  private recordAnalyticsBatch(
    batch: {
      topic: KafkaTopic;
      serviceName: string;
      count: number;
      taskCount: number;
      timelineCount: number;
    },
    source: DashboardEventSource,
  ) {
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
    this.analytics.peakEventsPerMinute = Math.max(
      this.analytics.peakEventsPerMinute,
      batch.count,
    );
    const lastBucket =
      this.analytics.timeline[this.analytics.timeline.length - 1];
    lastBucket.count += batch.timelineCount;

    if (this.shouldPersist(source)) {
      this.persistAnalyticsBatch(batch);
    }
  }

  private captureTransaction(event: DashboardEvent) {
    const payload = event.payload;
    const referenceId = this.toDisplayString(
      payload.orderId ??
        payload.transactionId ??
        payload.taskId ??
        payload.shopId ??
        payload.userId ??
        event.eventId,
    );
    const shop = this.toDisplayString(
      payload.shopName ?? payload.shopId ?? payload.shop ?? 'Food Chain HQ',
    );

    const transaction: DashboardTransaction = {
      id: `live-${event.eventId}`,
      type: this.getTransactionType(event.topic),
      title: event.eventName,
      shop,
      amount:
        typeof payload.totalAmount === 'number'
          ? payload.totalAmount
          : undefined,
      status: this.toDisplayString(
        payload.nextStatus ??
          payload.status ??
          payload.source ??
          event.eventName,
      ),
      source: this.toDisplayString(
        payload.source ?? payload.channel ?? 'KAFKA',
      ),
      referenceId,
      occurredAt: event.occurredAt,
    };

    this.transactions.unshift(transaction);
    this.transactions.splice(40);
  }

  private persistDashboardEvent(event: DashboardEvent) {
    void this.redisCache.incrementHashBy(
      'food-chain:dashboard:topic-counters',
      event.topic,
      1,
    );
    void this.redisCache.setJson(
      'food-chain:dashboard:analytics',
      this.analytics,
      60,
    );
    void this.redisCache.setJson(
      'food-chain:dashboard:recent-events',
      this.recentEvents,
      60,
    );
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

  private persistAnalyticsBatch(batch: {
    topic: KafkaTopic;
    serviceName: string;
    count: number;
    taskCount: number;
    timelineCount: number;
  }) {
    const payload = {
      batch,
      analytics: this.analytics,
      counters: this.consumedByTopic,
    };

    void this.redisCache.incrementHashBy(
      'food-chain:dashboard:service-load',
      batch.serviceName,
      batch.count,
    );
    void this.redisCache.setJson(
      'food-chain:dashboard:analytics',
      this.analytics,
      60,
    );
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

  private shouldPersist(source: DashboardEventSource) {
    return source === 'kafka' || this.isDemoPersistenceEnabled();
  }

  private getTransactionType(topic: KafkaTopic): DashboardTransaction['type'] {
    if (topic.startsWith('order.')) {
      return 'ORDER';
    }
    if (topic.startsWith('inventory.')) {
      return 'INVENTORY';
    }
    if (topic.startsWith('task.')) {
      return 'TASK';
    }
    if (topic === KafkaTopic.SHOP_CREATED) {
      return 'SHOP';
    }
    return 'USER';
  }

  private toDisplayString(value: unknown) {
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

  private async getServiceStatuses(): Promise<ServiceStatus[]> {
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

    return Promise.all(
      services.map(async (service) => {
        try {
          const response = await fetch(`${service.url}${service.healthPath}`, {
            signal: AbortSignal.timeout(1000),
          });
          const detail: unknown = await response.json().catch(() => undefined);

          return {
            ...service,
            healthy: response.ok,
            detail,
          };
        } catch (error) {
          return {
            ...service,
            healthy: false,
            detail: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );
  }

  private broadcast(eventName: string, payload: unknown) {
    for (const client of this.clients) {
      this.writeSse(client, eventName, payload);
    }
  }

  private writeSse(response: Response, eventName: string, payload: unknown) {
    response.write(`event: ${eventName}\n`);
    response.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  private isKafkaEnabled() {
    return this.configService.get<boolean>('KAFKA_ENABLED') ?? false;
  }

  private isDemoPersistenceEnabled() {
    return (
      this.configService.get<boolean>('DASHBOARD_DEMO_PERSIST_ENABLED') ?? false
    );
  }
}
