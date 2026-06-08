import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '../../../src/config/env.validation';
import { PremiumDashboardController } from './premium-dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [PremiumDashboardController],
})
export class PremiumDashboardModule {}
