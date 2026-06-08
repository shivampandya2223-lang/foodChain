import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisCacheService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RedisCacheService.name);
  private client?: RedisClient;
  private connected = false;
  private lastError?: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log('Redis cache disabled');
      return;
    }

    this.client = createClient({
      url: this.configService.get<string>('REDIS_URL'),
    });

    this.client.on('error', (error) => {
      this.connected = false;
      this.lastError = error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis error: ${this.lastError}`);
    });

    try {
      await this.client.connect();
      this.connected = true;
      this.logger.log('Redis cache connected');
    } catch (error) {
      this.connected = false;
      this.lastError = error instanceof Error ? error.message : String(error);
      this.logger.error(`Redis connection failed: ${this.lastError}`);
    }
  }

  async onApplicationShutdown() {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.connected = false;
    }
  }

  getStatus() {
    return {
      enabled: this.isEnabled(),
      connected: this.connected,
      url: this.configService.get<string>('REDIS_URL'),
      lastError: this.lastError,
    };
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number) {
    if (!this.client?.isOpen) {
      return;
    }

    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, serialized);
      return;
    }

    await this.client.set(key, serialized);
  }

  async incrementHashBy(key: string, field: string, amount: number) {
    if (!this.client?.isOpen) {
      return;
    }

    await this.client.hIncrBy(key, field, amount);
  }

  private isEnabled() {
    return this.configService.get<boolean>('REDIS_ENABLED') ?? false;
  }
}
