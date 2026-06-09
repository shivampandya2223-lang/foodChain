import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnvFilePaths } from '../../../src/config/env-file-paths';
import { envValidationSchema } from '../../../src/config/env.validation';
import { NotificationConsumerService } from './notification-consumer.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths('notification-service'),
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationConsumerService],
})
export class NotificationServiceModule {}
