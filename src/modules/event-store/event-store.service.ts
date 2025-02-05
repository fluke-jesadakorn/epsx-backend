import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Event } from '../../database/entities/event.entity';

interface EventData {
  type: string;
  data: string;
  market_code: string;
  exchange_name: string;
  country: string;
  currency: string;
  exchange_url: string;
  exchange_id: number;
  symbol: string;
  company_name: string;
  sector: string;
  aggregateId: string;
  version?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: MongoRepository<Event>
  ) {}

  async storeEvent(eventData: EventData): Promise<Event> {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  async getEvents(filter: Record<string, any> = {}): Promise<Event[]> {
    return this.eventRepository.find({
      where: filter,
      order: { createdAt: 'ASC' }
    });
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return this.getEvents({ type });
  }

  async getLatestEvent(filter: Record<string, any> = {}): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: filter,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * TODO: Future Improvements:
   * - Add event versioning and optimistic concurrency control
   * - Implement event snapshots for performance
   * - Add event validation middleware
   * - Add event replay functionality
   * - Implement event sourcing patterns
   * - Add event subscription mechanism
   * - Implement event archiving strategy
   * - Add event schema versioning
   * - Implement event compression for large payloads
   */
}
