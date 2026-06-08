import { Controller, Get } from '@nestjs/common';
import { InventoryConsumerService } from './inventory-consumer.service';

@Controller()
export class InventoryController {
  constructor(private readonly consumerService: InventoryConsumerService) {}

  @Get()
  getRoot() {
    return { service: 'food-chain-inventory-service', status: 'running' };
  }

  @Get('health')
  getHealth() {
    const kafka = this.consumerService.getStatus();
    return {
      service: 'food-chain-inventory-service',
      healthy: !kafka.enabled || kafka.connected,
      kafka,
    };
  }

  @Get('events/status')
  getStatus() {
    return this.consumerService.getStatus();
  }
}
