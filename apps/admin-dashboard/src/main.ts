import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AdminDashboardModule } from './admin-dashboard.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminDashboardModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('ADMIN_DASHBOARD_PORT') ?? '1309';
  app.enableCors();

  await app.listen(port);
  console.log(`Admin dashboard running on http://localhost:${port}`);
}

void bootstrap();
