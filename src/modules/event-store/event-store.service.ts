import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async storeEvent(event: Omit<Event, 'id' | 'timestamp'>): Promise<Event> {
    return this.eventRepository.save(event);
  }

  async getEventsByAggregateId(aggregateId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { aggregateId },
      order: { version: 'ASC' },
    });
  }

  async getLastEventVersion(aggregateId: string): Promise<number> {
    const lastEvent = await this.eventRepository.findOne({
      where: { aggregateId },
      order: { version: 'DESC' },
      select: ['version'],
    });
    return lastEvent ? lastEvent.version : 0;
  }
}
