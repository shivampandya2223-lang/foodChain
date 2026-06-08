import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuRecipeItemDto } from './menu-recipe-item.dto';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Margherita Pizza' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Classic cheese pizza' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '249.00' })
  @IsNumberString()
  price: string;

  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  shopId: string;

  @ApiProperty({ type: [MenuRecipeItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MenuRecipeItemDto)
  recipeItems: MenuRecipeItemDto[];
}
