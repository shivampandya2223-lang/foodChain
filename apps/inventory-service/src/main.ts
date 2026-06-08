import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { InventoryServiceModule } from './inventory-service.module';

async function bootstrap() {
  const app = await NestFactory.create(InventoryServiceModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('INVENTORY_SERVICE_PORT') ?? '1306';

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Food Chain Inventory Service')
      .setDescription(
        'Independent Kafka consumer for order and inventory events.',
      )
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
  console.log(`Inventory service running on http://localhost:${port}`);
}

void bootstrap();
