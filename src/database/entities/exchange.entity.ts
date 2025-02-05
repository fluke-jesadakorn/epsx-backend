import {
  Entity,
  ObjectIdColumn,
  Column,
  Index,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Stock } from './stock.entity';

@Entity('exchanges')
export class Exchange {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index({ unique: true })
  market_code: string;

  @Column()
  name: string;

  @Column()
  @Index()
  country: string;

  @Column()
  timezone: string;

  @Column({ nullable: true })
  open_time?: string;

  @Column({ nullable: true })
  close_time?: string;

  @Column()
  @Index()
  active: boolean;

  @Column('simple-json', { nullable: true })
  settings?: Record<string, string>;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @OneToMany(() => Stock, (stock) => stock.exchange)
  stocks_relation?: Stock[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * TODO: Future Improvements:
   * 1. Add validation for timezone format
   * 2. Implement market hours validation
   * 3. Add support for holiday schedules
   * 4. Consider adding trading session information
   * 5. Add support for market status monitoring
   */
}
