import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignShopUsersDto {
  @ApiProperty({
    type: [String],
    example: ['8d4434ac-4b58-4c26-aea8-fdf76f14524c'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds: string[];
}
