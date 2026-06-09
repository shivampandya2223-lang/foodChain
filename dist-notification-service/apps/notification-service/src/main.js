"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const notification_service_module_1 = require("./notification-service.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(notification_service_module_1.NotificationServiceModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('NOTIFICATION_SERVICE_PORT') ?? '1307';
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle('Food Chain Notification Service')
        .setDescription('Independent Kafka consumer for notification events.')
        .setVersion('1.0')
        .build());
    swagger_1.SwaggerModule.setup('docs', app, swaggerDocument);
    await app.listen(port);
    console.log(`Notification service running on http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map