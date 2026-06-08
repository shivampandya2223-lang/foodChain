import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';
import { renderDashboardHtml } from './dashboard.html';

@Controller()
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getDashboard() {
    return renderDashboardHtml();
  }

  @Get('health')
  getHealth() {
    return {
      service: 'food-chain-admin-dashboard',
      healthy: true,
      kafka: this.dashboardService.getKafkaStatus(),
    };
  }

  @Get('api/summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('events/stream')
  streamEvents(@Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    this.dashboardService.addClient(response);
  }
}
