import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '../../../src/config/env.validation';
import { InventoryConsumerService } from './inventory-consumer.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryConsumerService],
})
export class InventoryServiceModule {}
