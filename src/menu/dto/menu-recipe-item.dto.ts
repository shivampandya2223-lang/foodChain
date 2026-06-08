import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class MenuRecipeItemDto {
  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  productId: string;

  @ApiProperty({ example: '1.000' })
  @IsNumberString()
  quantity: string;

  @ApiPropertyOptional({ example: 'unit' })
  @IsOptional()
  @IsString()
  unit?: string;
}
