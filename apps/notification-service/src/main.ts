import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('NOTIFICATION_SERVICE_PORT') ?? '1307';

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Food Chain Notification Service')
      .setDescription('Independent Kafka consumer for notification events.')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
  console.log(`Notification service running on http://localhost:${port}`);
}

void bootstrap();
