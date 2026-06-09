import { KafkaTopic } from '../../../src/common/enums/kafka-topic.enum';
import { DomainEvent } from '../../../src/contracts/events/domain-event.type';
export type DashboardEvent = DomainEvent<Record<string, unknown>> & {
    topic: KafkaTopic;
};
export type DashboardTransaction = {
    id: string;
    type: 'ORDER' | 'INVENTORY' | 'TASK' | 'SHOP' | 'USER';
    title: string;
    shop: string;
    amount?: number;
    status: string;
    source: string;
    referenceId: string;
    occurredAt: string;
};
export type DashboardBusinessSnapshot = {
    revenueToday: number;
    ordersToday: number;
    lowStockItems: number;
    activeShops: number;
    pendingTasks: number;
};
export type DashboardEventAnalytics = {
    totalEvents: number;
    eventsPerMinute: number;
    peakEventsPerMinute: number;
    generatedRange: {
        min: number;
        max: number;
    };
    byTopic: Record<KafkaTopic, number>;
    byService: Record<string, number>;
    eventTasksByService: Record<string, number>;
    timeline: Array<{
        label: string;
        count: number;
    }>;
};
export declare const dashboardBusinessSnapshot: DashboardBusinessSnapshot;
export declare function createDashboardEventAnalytics(): DashboardEventAnalytics;
export declare const dashboardTransactions: DashboardTransaction[];
export declare const dashboardSeedEvents: DashboardEvent[];
export declare function getNextLiveDashboardEvent(): DashboardEvent;
export declare function getNextAnalyticsBatch(): {
    topic: KafkaTopic;
    serviceName: string;
    count: number;
    taskCount: number;
    timelineCount: number;
};
