import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { KafkaTopic } from '../../../src/common/enums/kafka-topic.enum';
import { MongoEventStoreService } from '../../../src/storage/mongo-event-store.service';
import { PostgresEventStoreService } from '../../../src/storage/postgres-event-store.service';
import { RedisCacheService } from '../../../src/storage/redis-cache.service';
import { DashboardEvent, DashboardEventAnalytics, DashboardTransaction } from './dashboard-live-data';
type ServiceStatus = {
    name: string;
    url: string;
    healthy: boolean;
    detail?: unknown;
};
export declare class AdminDashboardService implements OnModuleInit, OnApplicationShutdown {
    private readonly configService;
    private readonly redisCache;
    private readonly mongoEventStore;
    private readonly postgresEventStore;
    private readonly logger;
    private readonly topics;
    private readonly recentEvents;
    private readonly consumedByTopic;
    private readonly transactions;
    private readonly analytics;
    private readonly clients;
    private consumer?;
    private demoEventTimer?;
    private connected;
    private lastError?;
    constructor(configService: ConfigService, redisCache: RedisCacheService, mongoEventStore: MongoEventStoreService, postgresEventStore: PostgresEventStoreService);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(): Promise<void>;
    addClient(response: Response): void;
    getKafkaStatus(): {
        enabled: boolean;
        connected: boolean;
        brokers: string[];
        groupId: string;
        topics: KafkaTopic[];
        consumedByTopic: Partial<Record<KafkaTopic, number>>;
        recentEventCount: number;
        lastError: string | undefined;
    };
    getSummary(): Promise<{
        kafka: {
            enabled: boolean;
            connected: boolean;
            brokers: string[];
            groupId: string;
            topics: KafkaTopic[];
            consumedByTopic: Partial<Record<KafkaTopic, number>>;
            recentEventCount: number;
            lastError: string | undefined;
        };
        services: ServiceStatus[];
        modules: string[];
        roleHierarchy: string[];
        recentEvents: DashboardEvent[];
        transactions: DashboardTransaction[];
        business: import("./dashboard-live-data").DashboardBusinessSnapshot;
        analytics: DashboardEventAnalytics;
        storage: {
            redis: {
                enabled: boolean;
                connected: boolean;
                url: string | undefined;
                lastError: string | undefined;
            };
            mongo: {
                enabled: boolean;
                connected: boolean;
                uri: string | undefined;
                database: string | undefined;
                collection: string | undefined;
                lastError: string | undefined;
            };
            postgres: {
                enabled: boolean;
                host: string | undefined;
                database: string | undefined;
            };
        };
        persistence: {
            mode: string;
            demoPersistenceEnabled: boolean;
            databaseWritesActive: boolean;
            message: string;
        };
    }>;
    getStorageStatus(): {
        redis: {
            enabled: boolean;
            connected: boolean;
            url: string | undefined;
            lastError: string | undefined;
        };
        mongo: {
            enabled: boolean;
            connected: boolean;
            uri: string | undefined;
            database: string | undefined;
            collection: string | undefined;
            lastError: string | undefined;
        };
        postgres: {
            enabled: boolean;
            host: string | undefined;
            database: string | undefined;
        };
    };
    getPersistenceStatus(): {
        mode: string;
        demoPersistenceEnabled: boolean;
        databaseWritesActive: boolean;
        message: string;
    };
    private handleMessage;
    private hydrateDemoData;
    private startDemoEventStream;
    private hydrateAnalyticsCounters;
    private recordDashboardEvent;
    private recordAnalyticsBatch;
    private captureTransaction;
    private persistDashboardEvent;
    private persistAnalyticsBatch;
    private shouldPersist;
    private getTransactionType;
    private toDisplayString;
    private getServiceStatuses;
    private broadcast;
    private writeSse;
    private isKafkaEnabled;
    private isDemoPersistenceEnabled;
}
export {};
