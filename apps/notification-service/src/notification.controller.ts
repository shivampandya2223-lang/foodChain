import { Controller, Get } from '@nestjs/common';
import { NotificationConsumerService } from './notification-consumer.service';

@Controller()
export class NotificationController {
  constructor(private readonly consumerService: NotificationConsumerService) {}

  @Get()
  getRoot() {
    return { service: 'food-chain-notification-service', status: 'running' };
  }

  @Get('health')
  getHealth() {
    const kafka = this.consumerService.getStatus();
    return {
      service: 'food-chain-notification-service',
      healthy: !kafka.enabled || kafka.connected,
      kafka,
    };
  }

  @Get('events/status')
  getStatus() {
    return this.consumerService.getStatus();
  }
}
