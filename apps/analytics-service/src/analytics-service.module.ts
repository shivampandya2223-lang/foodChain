import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvFilePaths } from '../../../src/config/env-file-paths';
import { envValidationSchema } from '../../../src/config/env.validation';
import { AnalyticsConsumerService } from './analytics-consumer.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths('analytics-service'),
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsConsumerService],
})
export class AnalyticsServiceModule {}
