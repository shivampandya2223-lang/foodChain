import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { MenuRecipeItem } from './menu-recipe-item.entity';

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Shop, (shop) => shop.menuItems, { onDelete: 'CASCADE' })
  shop: Shop;

  @OneToMany(() => MenuRecipeItem, (recipeItem) => recipeItem.menuItem, {
    cascade: true,
  })
  recipeItems: MenuRecipeItem[];
}
