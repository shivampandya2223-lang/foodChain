import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
import { BaseEntity } from '../../database/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
export declare class Subscription extends BaseEntity {
    planName: string;
    status: SubscriptionStatus;
    startsAt: Date;
    endsAt?: Date;
    shop: Shop;
}
