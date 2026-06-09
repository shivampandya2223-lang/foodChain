import { ConfigService } from '@nestjs/config';
export declare class PremiumDashboardController {
    private readonly configService;
    constructor(configService: ConfigService);
    getDashboard(): string;
    getConfig(): string;
    getHealth(): {
        service: string;
        healthy: boolean;
    };
}
