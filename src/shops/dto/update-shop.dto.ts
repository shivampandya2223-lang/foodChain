import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateShopDto {
  @ApiPropertyOptional({ example: 'Downtown Food Shop' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'downtown-food-shop' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '123 Market Road, Ahmedabad' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c',
  })
  @IsOptional()
  @IsUUID('4')
  ownerId?: string;
}
