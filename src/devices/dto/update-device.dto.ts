import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../../common/enums/device-type.enum';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'Kitchen Order Tablet' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.STOCK_DEVICE })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @ApiPropertyOptional({ example: 'device-stock-001' })
  @IsOptional()
  @IsString()
  deviceKey?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
