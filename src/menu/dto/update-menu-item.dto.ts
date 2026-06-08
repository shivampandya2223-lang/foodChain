import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuRecipeItemDto } from './menu-recipe-item.dto';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 'Margherita Pizza' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Classic cheese pizza' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '249.00' })
  @IsOptional()
  @IsNumberString()
  price?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ type: [MenuRecipeItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuRecipeItemDto)
  recipeItems?: MenuRecipeItemDto[];
}
