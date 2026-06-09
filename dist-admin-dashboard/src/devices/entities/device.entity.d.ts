import { DeviceType } from '../../common/enums/device-type.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
export declare class Device extends BaseEntity {
    name: string;
    type: DeviceType;
    deviceKey?: string;
    isActive: boolean;
    shop: Shop;
}
