"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_module_1 = require("./analytics-service.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(analytics_service_module_1.AnalyticsServiceModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('ANALYTICS_SERVICE_PORT') ?? '1308';
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle('Food Chain Analytics Service')
        .setDescription('Independent Kafka consumer for analytics events.')
        .setVersion('1.0')
        .build());
    swagger_1.SwaggerModule.setup('docs', app, swaggerDocument);
    await app.listen(port);
    console.log(`Analytics service running on http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map