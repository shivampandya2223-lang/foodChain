import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { RoleType } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Shivam' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pandya' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+919999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: RoleType,
    isArray: true,
    example: [RoleType.OWNER],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleType, { each: true })
  roles: RoleType[];

  @ApiPropertyOptional({
    type: [String],
    example: ['8d4434ac-4b58-4c26-aea8-fdf76f14524c'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  shopIds?: string[];
}
