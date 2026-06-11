import { Column, Entity, ManyToOne } from 'typeorm';
import { DeviceType } from '../../common/enums/device-type.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('devices')
export class Device extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: DeviceType })
  type: DeviceType;

  @Column({ nullable: true, unique: true })
  deviceKey?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Shop, (shop) => shop.devices, { onDelete: 'CASCADE' })
  shop: Shop;
}
