import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Clean Kitchen' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Deep clean prep counter' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

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
