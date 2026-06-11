import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { OutboxService } from '../events/outbox.service';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly outboxService: OutboxService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.dataSource.transaction(async (manager) => {
      const shop = await manager.findOne(Shop, {
        where: { id: createTaskDto.shopId, isActive: true },
      });

      if (!shop) {
        throw new NotFoundException('Active shop not found');
      }

      const assignedTo = createTaskDto.assignedToId
        ? await manager.findOne(User, {
            where: { id: createTaskDto.assignedToId },
          })
        : undefined;

      if (createTaskDto.assignedToId && !assignedTo) {
        throw new NotFoundException('User not found');
      }

      const task = await manager.save(
        manager.create(Task, {
          title: createTaskDto.title,
          description: createTaskDto.description,
          dueAt: createTaskDto.dueAt
            ? new Date(createTaskDto.dueAt)
            : undefined,
          shop,
          assignedTo: assignedTo ?? undefined,
        }),
      );

      await this.outboxService.enqueue(
        KafkaTopic.TASK_CREATED,
        {
          taskId: task.id,
          shopId: shop.id,
          title: task.title,
          assignedToId: assignedTo?.id,
          status: task.status,
        },
        {
          aggregateId: task.id,
          aggregateType: 'Task',
          partitionKey: shop.id,
          manager,
        },
      );

      return task;
    });
  }

  findAll() {
    return this.tasksRepository.find({
      relations: { shop: true, assignedTo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, {
        where: { id },
        relations: { shop: true, assignedTo: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const previousStatus = task.status;
      const assignedTo = updateTaskDto.assignedToId
        ? await manager.findOne(User, {
            where: { id: updateTaskDto.assignedToId },
          })
        : task.assignedTo;

      if (updateTaskDto.assignedToId && !assignedTo) {
        throw new NotFoundException('User not found');
      }

      Object.assign(task, {
        title: updateTaskDto.title ?? task.title,
        description: updateTaskDto.description ?? task.description,
        status: updateTaskDto.status ?? task.status,
        dueAt: updateTaskDto.dueAt ? new Date(updateTaskDto.dueAt) : task.dueAt,
        assignedTo,
      });

      const updatedTask = await manager.save(task);

      if (
        previousStatus !== TaskStatus.DONE &&
        updatedTask.status === TaskStatus.DONE
      ) {
        await this.outboxService.enqueue(
          KafkaTopic.TASK_COMPLETED,
          {
            taskId: updatedTask.id,
            shopId: updatedTask.shop.id,
            title: updatedTask.title,
            assignedToId: updatedTask.assignedTo?.id,
            status: TaskStatus.DONE,
          },
          {
            aggregateId: updatedTask.id,
            aggregateType: 'Task',
            partitionKey: updatedTask.shop.id,
            manager,
          },
        );
      }

      return updatedTask;
    });
  }
}
