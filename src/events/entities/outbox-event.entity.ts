import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KafkaTopic } from '../../common/enums/kafka-topic.enum';

export enum OutboxEventStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

@Entity('outbox_events')
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  eventId: string;

  @Index()
  @Column({ type: 'varchar' })
  topic: KafkaTopic;

  @Column()
  eventName: string;

  @Index()
  @Column({ nullable: true })
  aggregateId?: string;

  @Column({ nullable: true })
  aggregateType?: string;

  @Column({ nullable: true })
  partitionKey?: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Index()
  @Column({
    type: 'enum',
    enum: OutboxEventStatus,
    default: OutboxEventStatus.PENDING,
  })
  status: OutboxEventStatus;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
