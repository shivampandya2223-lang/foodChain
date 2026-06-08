import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column()
  planName: string;

  @Column({ type: 'enum', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endsAt?: Date;

  @OneToOne(() => Shop, (shop) => shop.subscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;
}
