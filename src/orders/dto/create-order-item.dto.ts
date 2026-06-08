import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  menuItemId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
