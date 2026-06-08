import { RoleType } from '../../common/enums/role.enum';
import { DomainEvent } from './domain-event.type';

export type UserCreatedEvent = DomainEvent<{
  userId: string;
  email: string;
  roles: RoleType[];
  shopIds: string[];
  createdById?: string;
}>;
