import {
  Entity,
  Column,
} from 'typeorm';
import { CommonEntity } from './common.entity';

@Entity('events')
export class Event extends CommonEntity {
  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  data: string;

  @Column({ nullable: false })
  market_code: string;

  @Column({ nullable: false })
  exchange_name: string;

  @Column({ nullable: false })
  country: string;

  @Column({ nullable: false })
  currency: string;

  @Column({ nullable: false })
  exchange_url: string;

  @Column({ nullable: false })
  exchange_id: number;

  @Column({ nullable: false })
  symbol: string;

  @Column({ nullable: false })
  company_name: string;

  @Column({ nullable: false })
  sector: string;

  @Column({ nullable: false })
  aggregateId: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
  /**
   * TODO: Future Improvements:
   * - Add indexes for frequently queried fields
   * - Implement optimistic locking using version field
   * - Add data validation using class-validator
   * - Add support for event serialization/deserialization
   * - Implement event versioning strategy
   * - Add support for event sourcing patterns
   */
}
