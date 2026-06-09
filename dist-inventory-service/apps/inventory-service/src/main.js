"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_module_1 = require("./inventory-service.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(inventory_service_module_1.InventoryServiceModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('INVENTORY_SERVICE_PORT') ?? '1306';
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle('Food Chain Inventory Service')
        .setDescription('Independent Kafka consumer for order and inventory events.')
        .setVersion('1.0')
        .build());
    swagger_1.SwaggerModule.setup('docs', app, swaggerDocument);
    await app.listen(port);
    console.log(`Inventory service running on http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map