import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvFilePaths } from '../../../src/config/env-file-paths';
import { envValidationSchema } from '../../../src/config/env.validation';
import { PremiumDashboardController } from './premium-dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths('premium-dashboard'),
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [PremiumDashboardController],
})
export class PremiumDashboardModule {}
