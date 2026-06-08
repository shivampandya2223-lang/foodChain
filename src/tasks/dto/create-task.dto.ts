import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Refill Cheese Stock' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Move cheese from storage to prep station' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c' })
  @IsUUID('4')
  shopId: string;

  @ApiPropertyOptional({
    example: '8d4434ac-4b58-4c26-aea8-fdf76f14524c',
  })
  @IsOptional()
  @IsUUID('4')
  assignedToId?: string;

  @ApiPropertyOptional({ example: '2026-06-08T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
