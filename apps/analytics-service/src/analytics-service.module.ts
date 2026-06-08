import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '../../../src/config/env.validation';
import { AnalyticsConsumerService } from './analytics-consumer.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsConsumerService],
})
export class AnalyticsServiceModule {}
