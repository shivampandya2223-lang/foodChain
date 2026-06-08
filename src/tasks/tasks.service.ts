import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const shop = await this.findShop(createTaskDto.shopId);
    const assignedTo = createTaskDto.assignedToId
      ? await this.findUser(createTaskDto.assignedToId)
      : undefined;

    return this.tasksRepository.save(
      this.tasksRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueAt: createTaskDto.dueAt ? new Date(createTaskDto.dueAt) : undefined,
        shop,
        assignedTo,
      }),
    );
  }

  findAll() {
    return this.tasksRepository.find({
      relations: { shop: true, assignedTo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
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

    return this.tasksRepository.save(task);
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
