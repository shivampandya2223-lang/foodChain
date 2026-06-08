import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { createDomainEvent } from '../kafka/kafka-event.factory';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const shop = await this.findShop(createTaskDto.shopId);
    const assignedTo = createTaskDto.assignedToId
      ? await this.findUser(createTaskDto.assignedToId)
      : undefined;

    const task = await this.tasksRepository.save(
      this.tasksRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueAt: createTaskDto.dueAt ? new Date(createTaskDto.dueAt) : undefined,
        shop,
        assignedTo,
      }),
    );

    await this.kafkaProducer.publish(
      KafkaTopic.TASK_CREATED,
      createDomainEvent(KafkaTopic.TASK_CREATED, {
        taskId: task.id,
        shopId: shop.id,
        title: task.title,
        assignedToId: assignedTo?.id,
        status: task.status,
      }),
      task.id,
    );

    return task;
  }

  findAll() {
    return this.tasksRepository.find({
      relations: { shop: true, assignedTo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    const previousStatus = task.status;
    const assignedTo = updateTaskDto.assignedToId
      ? await this.findUser(updateTaskDto.assignedToId)
      : task.assignedTo;

    Object.assign(task, {
      title: updateTaskDto.title ?? task.title,
      description: updateTaskDto.description ?? task.description,
      status: updateTaskDto.status ?? task.status,
      dueAt: updateTaskDto.dueAt ? new Date(updateTaskDto.dueAt) : task.dueAt,
      assignedTo,
    });

    const updatedTask = await this.tasksRepository.save(task);

    if (
      previousStatus !== TaskStatus.DONE &&
      updatedTask.status === TaskStatus.DONE
    ) {
      await this.kafkaProducer.publish(
        KafkaTopic.TASK_COMPLETED,
        createDomainEvent(KafkaTopic.TASK_COMPLETED, {
          taskId: updatedTask.id,
          shopId: updatedTask.shop.id,
          title: updatedTask.title,
          assignedToId: updatedTask.assignedTo?.id,
          status: TaskStatus.DONE,
        }),
        updatedTask.id,
      );
    }

    return updatedTask;
  }

  private async findOne(id: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { shop: true, assignedTo: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async findShop(id: string) {
    const shop = await this.shopsRepository.findOne({ where: { id } });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  private async findUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
