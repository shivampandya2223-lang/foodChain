import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Shop, User])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TypeOrmModule, TasksService],
})
export class TasksModule {}
