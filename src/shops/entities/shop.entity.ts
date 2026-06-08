import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Device } from '../../devices/entities/device.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('shops')
export class Shop extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.ownedShops, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  owner?: User;

  @ManyToMany(() => User, (user) => user.shops)
  users: User[];

  @OneToOne(() => Subscription, (subscription) => subscription.shop)
  subscription?: Subscription;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.shop)
  menuItems: MenuItem[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.shop)
  inventoryItems: InventoryItem[];

  @OneToMany(() => Order, (order) => order.shop)
  orders: Order[];

  @OneToMany(() => Task, (task) => task.shop)
  tasks: Task[];

  @OneToMany(() => Device, (device) => device.shop)
  devices: Device[];
}
