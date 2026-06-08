import { Column, Entity, ManyToOne } from 'typeorm';
import { InventoryTransactionType } from '../../common/enums/inventory-transaction-type.enum';
import { InventoryTransactionSource } from '../../common/enums/inventory-transaction-source.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('inventory_transactions')
export class InventoryTransaction extends BaseEntity {
  @Column({ type: 'enum', enum: InventoryTransactionType })
  type: InventoryTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantityBefore: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantityAfter: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', default: InventoryTransactionSource.MANUAL })
  source: InventoryTransactionSource;

  @Column({ nullable: true })
  referenceId?: string;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  shop: Shop;

  @ManyToOne(
    () => InventoryItem,
    (inventoryItem) => inventoryItem.transactions,
    { onDelete: 'CASCADE' },
  )
  inventoryItem: InventoryItem;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User;
}
