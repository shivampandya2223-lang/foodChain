import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderPremiumDashboardHtml } from './premium-dashboard.html';

@Controller()
export class PremiumDashboardController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getDashboard() {
    return renderPremiumDashboardHtml();
  }

  @Get('config.js')
  @Header('Content-Type', 'application/javascript')
  getConfig() {
    const adminDashboardUrl =
      this.configService.get<string>('ADMIN_DASHBOARD_URL') ??
      'http://localhost:1309';

    return `window.FOOD_CHAIN_CONFIG = ${JSON.stringify({
      adminDashboardUrl,
    })};`;
  }

  @Get('health')
  getHealth() {
    return {
      service: 'food-chain-premium-dashboard',
      healthy: true,
    };
  }
}
