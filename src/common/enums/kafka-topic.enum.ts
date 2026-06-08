export enum KafkaTopic {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',

  INVENTORY_STOCK_IN = 'inventory.stock_in',
  INVENTORY_STOCK_OUT = 'inventory.stock_out',

  TASK_CREATED = 'task.created',
  TASK_COMPLETED = 'task.completed',

  SHOP_CREATED = 'shop.created',
  USER_CREATED = 'user.created',
}
