import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Document, MongoClient } from 'mongodb';

@Injectable()
export class MongoEventStoreService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(MongoEventStoreService.name);
  private client?: MongoClient;
  private collection?: Collection<Document>;
  private connected = false;
  private lastError?: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    if (!this.isEnabled()) {
      this.logger.log('Mongo event store disabled');
      return;
    }

    this.client = new MongoClient(
      this.configService.get<string>('MONGO_URI') ??
        'mongodb://localhost:27017',
    );

    try {
      await this.client.connect();
      const database = this.client.db(
        this.configService.get<string>('MONGO_DB_NAME') ?? 'food_chain_events',
      );
      this.collection = database.collection(
        this.configService.get<string>('MONGO_EVENTS_COLLECTION') ??
          'domain_events',
      );
      await this.collection.createIndex({ topic: 1, occurredAt: -1 });
      await this.collection.createIndex({ eventId: 1 }, { unique: true });
      this.connected = true;
      this.logger.log('Mongo event store connected');
    } catch (error) {
      this.connected = false;
      this.lastError = error instanceof Error ? error.message : String(error);
      this.logger.error(`Mongo connection failed: ${this.lastError}`);
    }
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
    }
  }

  getStatus() {
    return {
      enabled: this.isEnabled(),
      connected: this.connected,
      uri: this.configService.get<string>('MONGO_URI'),
      database: this.configService.get<string>('MONGO_DB_NAME'),
      collection: this.configService.get<string>('MONGO_EVENTS_COLLECTION'),
      lastError: this.lastError,
    };
  }

  async insertEvent(event: Document) {
    if (!this.collection) {
      return;
    }

    await this.collection.updateOne(
      { eventId: event.eventId },
      { $setOnInsert: { ...event, storedAt: new Date() } },
      { upsert: true },
    );
  }

  private isEnabled() {
    return this.configService.get<boolean>('MONGO_ENABLED') ?? false;
  }
}
