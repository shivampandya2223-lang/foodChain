import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Cheese' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CHEESE-001' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: 'Mozzarella cheese for pizza recipes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '120.00' })
  @IsNumberString()
  price: string;

  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  shopId: string;
}
