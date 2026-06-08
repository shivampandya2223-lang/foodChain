import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => MenuItem, { nullable: true, onDelete: 'SET NULL' })
  menuItem?: MenuItem;
}
