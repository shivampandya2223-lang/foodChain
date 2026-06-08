import { Controller, Get } from '@nestjs/common';
import { AnalyticsConsumerService } from './analytics-consumer.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly consumerService: AnalyticsConsumerService) {}

  @Get()
  getRoot() {
    return { service: 'food-chain-analytics-service', status: 'running' };
  }

  @Get('health')
  getHealth() {
    const kafka = this.consumerService.getStatus();
    return {
      service: 'food-chain-analytics-service',
      healthy: !kafka.enabled || kafka.connected,
      kafka,
    };
  }

  @Get('events/status')
  getStatus() {
    return this.consumerService.getStatus();
  }
}
