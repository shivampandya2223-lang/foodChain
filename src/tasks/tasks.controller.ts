import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionType } from '../common/enums/role.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Permissions(PermissionType.TASK_CREATE)
  @ApiOperation({ summary: 'Create an employee task' })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @Permissions(PermissionType.TASK_READ)
  @ApiOperation({ summary: 'List tasks' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Patch(':id')
  @Permissions(PermissionType.TASK_UPDATE)
  @ApiOperation({ summary: 'Update task status/details' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }
}
