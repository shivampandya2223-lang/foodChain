import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reorderLevel: number;

  @ManyToOne(() => Shop, (shop) => shop.inventoryItems, { onDelete: 'CASCADE' })
  shop: Shop;

  @OneToOne(() => Product, (product) => product.inventoryItem, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
