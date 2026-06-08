import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeviceType } from '../../common/enums/device-type.enum';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Kitchen Order Tablet' })
  @IsString()
  name: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.ORDER_DEVICE })
  @IsEnum(DeviceType)
  type: DeviceType;

  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  shopId: string;

  @ApiPropertyOptional({ example: 'device-order-001' })
  @IsOptional()
  @IsString()
  deviceKey?: string;
}
