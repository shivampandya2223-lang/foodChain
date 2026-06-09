import { BaseEntity } from '../../database/base.entity';
export declare class SystemSetting extends BaseEntity {
    key: string;
    value: Record<string, unknown>;
    description?: string;
}
