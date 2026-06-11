import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export enum OrderStatusUpdate {
  CONFIRMED = OrderStatus.CONFIRMED,
  PREPARING = OrderStatus.PREPARING,
  READY = OrderStatus.READY,
  COMPLETED = OrderStatus.COMPLETED,
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatusUpdate,
    example: OrderStatusUpdate.CONFIRMED,
  })
  @IsEnum(OrderStatusUpdate)
  status: OrderStatusUpdate;
}
