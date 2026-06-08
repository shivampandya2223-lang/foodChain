import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  shopId: string;

  @ApiPropertyOptional({ example: 'Walk-in Customer' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
