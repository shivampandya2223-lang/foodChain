"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaTopic = void 0;
var KafkaTopic;
(function (KafkaTopic) {
    KafkaTopic["ORDER_CREATED"] = "order.created";
    KafkaTopic["ORDER_UPDATED"] = "order.updated";
    KafkaTopic["ORDER_CANCELLED"] = "order.cancelled";
    KafkaTopic["INVENTORY_STOCK_IN"] = "inventory.stock_in";
    KafkaTopic["INVENTORY_STOCK_OUT"] = "inventory.stock_out";
    KafkaTopic["TASK_CREATED"] = "task.created";
    KafkaTopic["TASK_COMPLETED"] = "task.completed";
    KafkaTopic["SHOP_CREATED"] = "shop.created";
    KafkaTopic["USER_CREATED"] = "user.created";
})(KafkaTopic || (exports.KafkaTopic = KafkaTopic = {}));
//# sourceMappingURL=kafka-topic.enum.js.map