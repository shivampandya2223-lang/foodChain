import type { Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';
export declare class AdminDashboardController {
    private readonly dashboardService;
    constructor(dashboardService: AdminDashboardService);
    getDashboard(): string;
    getHealth(): {
        service: string;
        healthy: boolean;
        kafka: {
            enabled: boolean;
            connected: boolean;
            brokers: string[];
            groupId: string;
            topics: import("../../../src/common/enums/kafka-topic.enum").KafkaTopic[];
            consumedByTopic: Partial<Record<import("../../../src/common/enums/kafka-topic.enum").KafkaTopic, number>>;
            recentEventCount: number;
            lastError: string | undefined;
        };
    };
    getSummary(): Promise<{
        kafka: {
            enabled: boolean;
            connected: boolean;
            brokers: string[];
            groupId: string;
            topics: import("../../../src/common/enums/kafka-topic.enum").KafkaTopic[];
            consumedByTopic: Partial<Record<import("../../../src/common/enums/kafka-topic.enum").KafkaTopic, number>>;
            recentEventCount: number;
            lastError: string | undefined;
        };
        services: {
            name: string;
            url: string;
            healthy: boolean;
            detail?: unknown;
        }[];
        modules: string[];
        roleHierarchy: string[];
        recentEvents: import("./dashboard-live-data").DashboardEvent[];
        transactions: import("./dashboard-live-data").DashboardTransaction[];
        business: import("./dashboard-live-data").DashboardBusinessSnapshot;
        analytics: import("./dashboard-live-data").DashboardEventAnalytics;
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
    streamEvents(response: Response): void;
}
