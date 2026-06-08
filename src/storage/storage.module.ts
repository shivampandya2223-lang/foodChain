import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEventLog } from './entities/domain-event-log.entity';
import { MongoEventStoreService } from './mongo-event-store.service';
import { PostgresEventStoreService } from './postgres-event-store.service';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DomainEventLog])],
  providers: [
    RedisCacheService,
    MongoEventStoreService,
    PostgresEventStoreService,
  ],
  exports: [
    RedisCacheService,
    MongoEventStoreService,
    PostgresEventStoreService,
  ],
})
export class StorageModule {}
