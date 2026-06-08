import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Shop])],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [TypeOrmModule, DevicesService],
})
export class DevicesModule {}
