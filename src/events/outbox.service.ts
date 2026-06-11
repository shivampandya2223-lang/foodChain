import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { KafkaTopic } from '../common/enums/kafka-topic.enum';
import { createDomainEvent } from '../kafka/kafka-event.factory';
import { OutboxEvent } from './entities/outbox-event.entity';

type EnqueueOptions = {
  aggregateId?: string;
  aggregateType?: string;
  partitionKey?: string;
  manager?: EntityManager;
};

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
  ) {}

  async enqueue<TPayload extends Record<string, unknown>>(
    topic: KafkaTopic,
    payload: TPayload,
    options: EnqueueOptions = {},
  ) {
    const event = createDomainEvent(topic, payload);
    const repository = options.manager
      ? options.manager.getRepository(OutboxEvent)
      : this.outboxRepository;

    await repository.save(
      repository.create({
        eventId: event.eventId,
        topic,
        eventName: event.eventName,
        aggregateId: options.aggregateId,
        aggregateType: options.aggregateType,
        partitionKey: options.partitionKey,
        payload: event.payload,
      }),
    );

    return event;
  }
}
