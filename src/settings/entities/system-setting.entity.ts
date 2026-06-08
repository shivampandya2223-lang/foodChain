import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: Record<string, unknown>;

  @Column({ nullable: true })
  description?: string;
}
