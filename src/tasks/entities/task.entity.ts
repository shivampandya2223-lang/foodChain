import { Column, Entity, ManyToOne } from 'typeorm';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  dueAt?: Date;

  @ManyToOne(() => Shop, (shop) => shop.tasks, { onDelete: 'CASCADE' })
  shop: Shop;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  assignedTo?: User;
}
