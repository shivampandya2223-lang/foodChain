import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menu_recipe_items')
export class MenuRecipeItem extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: string;

  @Column({ default: 'unit' })
  unit: string;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.recipeItems, {
    onDelete: 'CASCADE',
  })
  menuItem: MenuItem;

  @ManyToOne(() => Product, (product) => product.menuRecipeItems, {
    onDelete: 'RESTRICT',
  })
  product: Product;
}
