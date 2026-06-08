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

const nowMinus = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const dashboardEventTarget = 248_600;

export const dashboardBusinessSnapshot: DashboardBusinessSnapshot = {
  revenueToday: 18_72_450,
  ordersToday: 4_286,
  lowStockItems: 19,
  activeShops: 7,
  pendingTasks: 48,
};

export function createDashboardEventAnalytics(): DashboardEventAnalytics {
  const byTopic: Record<KafkaTopic, number> = {
    [KafkaTopic.ORDER_CREATED]: 78_420,
    [KafkaTopic.ORDER_UPDATED]: 62_880,
    [KafkaTopic.ORDER_CANCELLED]: 5_740,
    [KafkaTopic.INVENTORY_STOCK_IN]: 21_360,
    [KafkaTopic.INVENTORY_STOCK_OUT]: 44_920,
    [KafkaTopic.TASK_CREATED]: 13_640,
    [KafkaTopic.TASK_COMPLETED]: 11_280,
    [KafkaTopic.SHOP_CREATED]: 280,
    [KafkaTopic.USER_CREATED]: 10_080,
  };
  const timeline = Array.from({ length: 24 }, (_, index) => {
    const wave = Math.sin((index / 23) * Math.PI);
    const lunchRush = index >= 10 && index <= 14 ? 1.3 : 1;
    const dinnerRush = index >= 18 && index <= 22 ? 1.55 : 1;
    const count = Math.round((5_600 + wave * 5_900) * lunchRush * dinnerRush);

    return {
      label: `${String(index).padStart(2, '0')}:00`,
      count,
    };
  });
  const byService = {
    'Core API': 1_05_940,
    'Inventory Service': 66_280,
    'Notification Service': 38_640,
    'Analytics Service': 37_740,
  };
  const eventTasksByService = {
    'Core API': 18_420,
    'Inventory Service': 12_680,
    'Notification Service': 8_340,
    'Analytics Service': 14_960,
  };

  return {
    totalEvents: dashboardEventTarget,
    eventsPerMinute: 2_184,
    peakEventsPerMinute: 7_920,
    generatedRange: {
      min: 100_000,
      max: 300_000,
    },
    byTopic,
    byService,
    eventTasksByService,
    timeline,
  };
}

export const dashboardTransactions: DashboardTransaction[] = [
  {
    id: 'txn-1009',
    type: 'ORDER',
    title: 'Order ORD-2026-118 confirmed',
    shop: 'Ahmedabad Central Kitchen',
    amount: 1047,
    status: 'CONFIRMED',
    source: 'ORDER_DEVICE',
    referenceId: 'ORD-2026-118',
    occurredAt: nowMinus(2),
  },
  {
    id: 'txn-1008',
    type: 'INVENTORY',
    title: 'Cheese deducted for pizza recipe',
    shop: 'Ahmedabad Central Kitchen',
    status: 'STOCK_OUT',
    source: 'ORDER',
    referenceId: 'ORD-2026-118',
    occurredAt: nowMinus(3),
  },
  {
    id: 'txn-1007',
    type: 'TASK',
    title: 'Refill cold drink fridge assigned',
    shop: 'Surat Ring Road',
    status: 'ASSIGNED',
    source: 'OWNER',
    referenceId: 'TASK-442',
    occurredAt: nowMinus(6),
  },
  {
    id: 'txn-1006',
    type: 'INVENTORY',
    title: 'Paneer stock received from supplier',
    shop: 'Vadodara Alkapuri',
    status: 'STOCK_IN',
    source: 'PURCHASE',
    referenceId: 'PO-771',
    occurredAt: nowMinus(10),
  },
  {
    id: 'txn-1005',
    type: 'ORDER',
    title: 'Order ORD-2026-117 completed',
    shop: 'Rajkot Kalawad Road',
    amount: 689,
    status: 'COMPLETED',
    source: 'ORDER_DEVICE',
    referenceId: 'ORD-2026-117',
    occurredAt: nowMinus(14),
  },
];

export const dashboardSeedEvents: DashboardEvent[] = [
  {
    topic: KafkaTopic.ORDER_CREATED,
    eventId: 'evt-order-118',
    eventName: 'OrderCreated',
    occurredAt: nowMinus(2),
    payload: {
      orderId: 'ORD-2026-118',
      shopId: 'SHOP-AHD-01',
      shopName: 'Ahmedabad Central Kitchen',
      customerName: 'Walk-in Customer',
      channel: 'ORDER_DEVICE',
      items: [
        { menuItem: 'Margherita Pizza', quantity: 1, price: 349 },
        { menuItem: 'Paneer Tikka Pizza', quantity: 2, price: 449 },
      ],
      totalAmount: 1047,
      status: 'PENDING',
    },
  },
  {
    topic: KafkaTopic.ORDER_UPDATED,
    eventId: 'evt-order-118-confirmed',
    eventName: 'OrderStatusUpdated',
    occurredAt: nowMinus(1),
    payload: {
      orderId: 'ORD-2026-118',
      previousStatus: 'PENDING',
      nextStatus: 'CONFIRMED',
      updatedBy: 'EMP-024',
      kitchenQueuePosition: 3,
    },
  },
  {
    topic: KafkaTopic.INVENTORY_STOCK_OUT,
    eventId: 'evt-stock-out-118',
    eventName: 'InventoryStockOut',
    occurredAt: nowMinus(1),
    payload: {
      transactionId: 'INV-TXN-9001',
      shopId: 'SHOP-AHD-01',
      productName: 'Cheese',
      quantity: 450,
      unit: 'GRAM',
      source: 'ORDER',
      referenceId: 'ORD-2026-118',
      remainingStock: 5200,
    },
  },
  {
    topic: KafkaTopic.TASK_CREATED,
    eventId: 'evt-task-442',
    eventName: 'TaskCreated',
    occurredAt: nowMinus(6),
    payload: {
      taskId: 'TASK-442',
      title: 'Refill cold drink fridge',
      shopName: 'Surat Ring Road',
      assignedBy: 'OWNER',
      assignedTo: 'EMP-033',
      priority: 'HIGH',
      status: 'PENDING',
    },
  },
  {
    topic: KafkaTopic.INVENTORY_STOCK_IN,
    eventId: 'evt-stock-in-771',
    eventName: 'InventoryStockIn',
    occurredAt: nowMinus(10),
    payload: {
      transactionId: 'INV-TXN-8997',
      shopId: 'SHOP-VAD-02',
      productName: 'Paneer',
      quantity: 12,
      unit: 'KG',
      source: 'PURCHASE',
      referenceId: 'PO-771',
      currentStock: 31,
    },
  },
  {
    topic: KafkaTopic.SHOP_CREATED,
    eventId: 'evt-shop-008',
    eventName: 'ShopCreated',
    occurredAt: nowMinus(18),
    payload: {
      shopId: 'SHOP-BLR-08',
      shopName: 'Bengaluru Indiranagar',
      ownerEmail: 'owner.indiranagar@example.com',
      createdBy: 'SUPER_ADMIN',
      subscriptionStatus: 'ACTIVE',
    },
  },
  {
    topic: KafkaTopic.USER_CREATED,
    eventId: 'evt-user-207',
    eventName: 'UserCreated',
    occurredAt: nowMinus(21),
    payload: {
      userId: 'USR-207',
      email: 'employee.shift2@example.com',
      role: 'EMPLOYEE',
      shopName: 'Ahmedabad Central Kitchen',
      createdBy: 'OWNER',
    },
  },
];

const liveEventTemplates: Array<
  Omit<DashboardEvent, 'eventId' | 'occurredAt'>
> = [
  {
    topic: KafkaTopic.ORDER_UPDATED,
    eventName: 'OrderStatusUpdated',
    payload: {
      orderId: 'ORD-2026-118',
      shopName: 'Ahmedabad Central Kitchen',
      previousStatus: 'CONFIRMED',
      nextStatus: 'PREPARING',
      station: 'Kitchen Line 1',
      updatedBy: 'EMP-024',
    },
  },
  {
    topic: KafkaTopic.ORDER_UPDATED,
    eventName: 'OrderStatusUpdated',
    payload: {
      orderId: 'ORD-2026-118',
      shopName: 'Ahmedabad Central Kitchen',
      previousStatus: 'PREPARING',
      nextStatus: 'READY',
      station: 'Pickup Counter',
      updatedBy: 'EMP-024',
    },
  },
  {
    topic: KafkaTopic.INVENTORY_STOCK_OUT,
    eventName: 'InventoryStockOut',
    payload: {
      transactionId: 'INV-TXN-9002',
      shopId: 'SHOP-AHD-01',
      productName: 'Dough',
      quantity: 3,
      unit: 'PIECE',
      source: 'ORDER',
      referenceId: 'ORD-2026-119',
      remainingStock: 42,
    },
  },
  {
    topic: KafkaTopic.TASK_COMPLETED,
    eventName: 'TaskCompleted',
    payload: {
      taskId: 'TASK-442',
      title: 'Refill cold drink fridge',
      completedBy: 'EMP-033',
      shopName: 'Surat Ring Road',
      status: 'COMPLETED',
    },
  },
  {
    topic: KafkaTopic.ORDER_CREATED,
    eventName: 'OrderCreated',
    payload: {
      orderId: 'ORD-2026-119',
      shopId: 'SHOP-SRT-03',
      shopName: 'Surat Ring Road',
      channel: 'ORDER_DEVICE',
      items: [{ menuItem: 'Farmhouse Pizza', quantity: 1, price: 529 }],
      totalAmount: 529,
      status: 'PENDING',
    },
  },
];

let liveEventCursor = 0;
let liveAnalyticsCursor = 0;

export function getNextLiveDashboardEvent(): DashboardEvent {
  const template =
    liveEventTemplates[liveEventCursor % liveEventTemplates.length];
  liveEventCursor += 1;

  return {
    ...template,
    eventId: `demo-${Date.now()}-${liveEventCursor}`,
    occurredAt: new Date().toISOString(),
    payload: {
      ...template.payload,
      demo: true,
    },
  };
}

export function getNextAnalyticsBatch(): {
  topic: KafkaTopic;
  serviceName: string;
  count: number;
  taskCount: number;
  timelineCount: number;
} {
  const topics = Object.values(KafkaTopic);
  const services = [
    'Core API',
    'Inventory Service',
    'Notification Service',
    'Analytics Service',
  ];
  const topic = topics[liveAnalyticsCursor % topics.length];
  const serviceName = services[liveAnalyticsCursor % services.length];
  const count = 850 + ((liveAnalyticsCursor * 337) % 2_900);
  const taskCount = 120 + ((liveAnalyticsCursor * 149) % 960);
  const timelineCount = 4_200 + ((liveAnalyticsCursor * 719) % 9_500);
  liveAnalyticsCursor += 1;

  return {
    topic,
    serviceName,
    count,
    taskCount,
    timelineCount,
  };
}
