import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  quantity: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  reorderLevel: string;

  @ManyToOne(() => Shop, (shop) => shop.inventoryItems, { onDelete: 'CASCADE' })
  shop: Shop;

  @OneToOne(() => Product, (product) => product.inventoryItem, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(
    () => InventoryTransaction,
    (inventoryTransaction) => inventoryTransaction.inventoryItem,
  )
  transactions: InventoryTransaction[];
}
