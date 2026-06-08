import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { Shop } from './entities/shop.entity';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User]), KafkaModule],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [TypeOrmModule, ShopsService],
})
export class ShopsModule {}
