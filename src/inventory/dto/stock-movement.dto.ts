import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class StockMovementDto {
  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  inventoryItemId: string;

  @ApiProperty({ example: '25.000' })
  @IsNumberString()
  quantity: string;

  @ApiPropertyOptional({ example: 'Supplier delivery' })
  @IsOptional()
  @IsString()
  reason?: string;
}
