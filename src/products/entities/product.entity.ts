import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { MenuRecipeItem } from '../../menu/entities/menu-recipe-item.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('products')
@Index(['shop', 'sku'], { unique: true })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  sku: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'CASCADE' })
  shop: Shop;

  @OneToOne(() => InventoryItem, (inventoryItem) => inventoryItem.product)
  inventoryItem?: InventoryItem;

  @OneToMany(() => MenuRecipeItem, (recipeItem) => recipeItem.product)
  menuRecipeItems: MenuRecipeItem[];
}
