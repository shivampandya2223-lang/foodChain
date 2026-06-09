"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.PermissionType = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["SUPER_ADMIN"] = "SUPER_ADMIN";
    RoleType["ADMIN"] = "ADMIN";
    RoleType["OWNER"] = "OWNER";
    RoleType["EMPLOYEE"] = "EMPLOYEE";
})(RoleType || (exports.RoleType = RoleType = {}));
var PermissionType;
(function (PermissionType) {
    PermissionType["USER_CREATE"] = "user.create";
    PermissionType["USER_READ"] = "user.read";
    PermissionType["USER_UPDATE"] = "user.update";
    PermissionType["USER_DELETE"] = "user.delete";
    PermissionType["SHOP_CREATE"] = "shop.create";
    PermissionType["SHOP_READ"] = "shop.read";
    PermissionType["SHOP_UPDATE"] = "shop.update";
    PermissionType["SHOP_DELETE"] = "shop.delete";
    PermissionType["PRODUCT_CREATE"] = "product.create";
    PermissionType["PRODUCT_READ"] = "product.read";
    PermissionType["PRODUCT_UPDATE"] = "product.update";
    PermissionType["PRODUCT_DELETE"] = "product.delete";
    PermissionType["INVENTORY_STOCK_IN"] = "inventory.stock_in";
    PermissionType["INVENTORY_STOCK_OUT"] = "inventory.stock_out";
    PermissionType["INVENTORY_READ"] = "inventory.read";
    PermissionType["INVENTORY_TRANSACTION_READ"] = "inventory.transaction.read";
    PermissionType["MENU_CREATE"] = "menu.create";
    PermissionType["MENU_READ"] = "menu.read";
    PermissionType["MENU_UPDATE"] = "menu.update";
    PermissionType["MENU_DELETE"] = "menu.delete";
    PermissionType["ORDER_CREATE"] = "order.create";
    PermissionType["ORDER_READ"] = "order.read";
    PermissionType["ORDER_UPDATE_STATUS"] = "order.update_status";
    PermissionType["ORDER_CANCEL"] = "order.cancel";
    PermissionType["TASK_CREATE"] = "task.create";
    PermissionType["TASK_READ"] = "task.read";
    PermissionType["TASK_UPDATE"] = "task.update";
    PermissionType["DEVICE_CREATE"] = "device.create";
    PermissionType["DEVICE_READ"] = "device.read";
    PermissionType["DEVICE_UPDATE"] = "device.update";
    PermissionType["SUBSCRIPTION_MANAGE"] = "subscription.manage";
    PermissionType["REPORT_READ_ALL"] = "report.read_all";
    PermissionType["REPORT_READ_SHOP"] = "report.read_shop";
    PermissionType["SETTING_MANAGE"] = "setting.manage";
    PermissionType["PERMISSION_MANAGE"] = "permission.manage";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
exports.RolePermissions = {
    [RoleType.SUPER_ADMIN]: Object.values(PermissionType),
    [RoleType.ADMIN]: [
        PermissionType.USER_CREATE,
        PermissionType.USER_READ,
        PermissionType.USER_UPDATE,
        PermissionType.SHOP_CREATE,
        PermissionType.SHOP_READ,
        PermissionType.SHOP_UPDATE,
        PermissionType.PRODUCT_CREATE,
        PermissionType.PRODUCT_READ,
        PermissionType.PRODUCT_UPDATE,
        PermissionType.PRODUCT_DELETE,
        PermissionType.INVENTORY_STOCK_IN,
        PermissionType.INVENTORY_STOCK_OUT,
        PermissionType.INVENTORY_READ,
        PermissionType.INVENTORY_TRANSACTION_READ,
        PermissionType.MENU_CREATE,
        PermissionType.MENU_READ,
        PermissionType.MENU_UPDATE,
        PermissionType.MENU_DELETE,
        PermissionType.ORDER_CREATE,
        PermissionType.ORDER_READ,
        PermissionType.ORDER_UPDATE_STATUS,
        PermissionType.ORDER_CANCEL,
        PermissionType.TASK_CREATE,
        PermissionType.TASK_READ,
        PermissionType.TASK_UPDATE,
        PermissionType.DEVICE_CREATE,
        PermissionType.DEVICE_READ,
        PermissionType.DEVICE_UPDATE,
        PermissionType.REPORT_READ_SHOP,
        PermissionType.PERMISSION_MANAGE,
    ],
    [RoleType.OWNER]: [
        PermissionType.USER_CREATE,
        PermissionType.USER_READ,
        PermissionType.USER_UPDATE,
        PermissionType.SHOP_READ,
        PermissionType.PRODUCT_CREATE,
        PermissionType.PRODUCT_READ,
        PermissionType.PRODUCT_UPDATE,
        PermissionType.PRODUCT_DELETE,
        PermissionType.INVENTORY_STOCK_IN,
        PermissionType.INVENTORY_STOCK_OUT,
        PermissionType.INVENTORY_READ,
        PermissionType.INVENTORY_TRANSACTION_READ,
        PermissionType.MENU_CREATE,
        PermissionType.MENU_READ,
        PermissionType.MENU_UPDATE,
        PermissionType.MENU_DELETE,
        PermissionType.ORDER_CREATE,
        PermissionType.ORDER_READ,
        PermissionType.ORDER_UPDATE_STATUS,
        PermissionType.ORDER_CANCEL,
        PermissionType.TASK_CREATE,
        PermissionType.TASK_READ,
        PermissionType.TASK_UPDATE,
        PermissionType.DEVICE_CREATE,
        PermissionType.DEVICE_READ,
        PermissionType.DEVICE_UPDATE,
        PermissionType.REPORT_READ_SHOP,
    ],
    [RoleType.EMPLOYEE]: [
        PermissionType.PRODUCT_READ,
        PermissionType.INVENTORY_READ,
        PermissionType.INVENTORY_STOCK_IN,
        PermissionType.INVENTORY_STOCK_OUT,
        PermissionType.MENU_READ,
        PermissionType.ORDER_CREATE,
        PermissionType.ORDER_READ,
        PermissionType.ORDER_UPDATE_STATUS,
        PermissionType.ORDER_CANCEL,
        PermissionType.TASK_READ,
        PermissionType.TASK_UPDATE,
    ],
};
//# sourceMappingURL=role.enum.js.map