import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: string;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @ManyToOne(() => Shop, (shop) => shop.orders, { onDelete: 'CASCADE' })
  shop: Shop;

  @ManyToOne(() => User, (user) => user.ordersHandled, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  employee?: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];
}
