import { TaskStatus } from '../../common/enums/task-status.enum';
import { DomainEvent } from './domain-event.type';

export type TaskCreatedEvent = DomainEvent<{
  taskId: string;
  shopId: string;
  title: string;
  assignedToId?: string;
  status: TaskStatus;
}>;

export type TaskCompletedEvent = DomainEvent<{
  taskId: string;
  shopId: string;
  title: string;
  assignedToId?: string;
  status: TaskStatus.DONE;
}>;
