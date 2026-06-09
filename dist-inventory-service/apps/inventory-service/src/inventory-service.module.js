"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_file_paths_1 = require("../../../src/config/env-file-paths");
const env_validation_1 = require("../../../src/config/env.validation");
const inventory_consumer_service_1 = require("./inventory-consumer.service");
const inventory_controller_1 = require("./inventory.controller");
let InventoryServiceModule = class InventoryServiceModule {
};
exports.InventoryServiceModule = InventoryServiceModule;
exports.InventoryServiceModule = InventoryServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: (0, env_file_paths_1.getEnvFilePaths)('inventory-service'),
                validationSchema: env_validation_1.envValidationSchema,
            }),
        ],
        controllers: [inventory_controller_1.InventoryController],
        providers: [inventory_consumer_service_1.InventoryConsumerService],
    })
], InventoryServiceModule);
//# sourceMappingURL=inventory-service.module.js.map