import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { PremiumDashboardModule } from './premium-dashboard.module';

async function bootstrap() {
  const app = await NestFactory.create(PremiumDashboardModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PREMIUM_DASHBOARD_PORT') ?? '1310';

  await app.listen(port);
  console.log(`Premium dashboard running on http://localhost:${port}`);
}

void bootstrap();
