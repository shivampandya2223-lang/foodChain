import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AnalyticsServiceModule } from './analytics-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsServiceModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('ANALYTICS_SERVICE_PORT') ?? '1308';

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Food Chain Analytics Service')
      .setDescription('Independent Kafka consumer for analytics events.')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
  console.log(`Analytics service running on http://localhost:${port}`);
}

void bootstrap();
