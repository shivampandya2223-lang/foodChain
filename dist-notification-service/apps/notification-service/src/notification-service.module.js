"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_file_paths_1 = require("../../../src/config/env-file-paths");
const env_validation_1 = require("../../../src/config/env.validation");
const notification_consumer_service_1 = require("./notification-consumer.service");
const notification_controller_1 = require("./notification.controller");
let NotificationServiceModule = class NotificationServiceModule {
};
exports.NotificationServiceModule = NotificationServiceModule;
exports.NotificationServiceModule = NotificationServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: (0, env_file_paths_1.getEnvFilePaths)('notification-service'),
                validationSchema: env_validation_1.envValidationSchema,
            }),
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_consumer_service_1.NotificationConsumerService],
    })
], NotificationServiceModule);
//# sourceMappingURL=notification-service.module.js.map