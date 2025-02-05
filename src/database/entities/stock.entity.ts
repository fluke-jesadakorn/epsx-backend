import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Financial } from './financial.entity';
import { Exchange } from './exchange.entity';
import { CommonEntity } from './common.entity';

@Entity('stocks')
@Index(['sector', 'industry'])
export class Stock extends CommonEntity {
  @Column()
  @Index({ unique: true })
  symbol: string;

  @Column()
  @Index()
  company_name: string;

  @Column('simple-json', { nullable: false })
  @Index()
  exchanges: { market_code: string; primary: boolean }[];

  @Column({ nullable: true })
  @Index()
  sector?: string;

  @Column({ nullable: true })
  @Index()
  industry?: string;

  @Column('simple-json', { nullable: true })
  metadata?: {
    website?: string;
    description?: string;
    employees?: number;
    founded?: number;
    ceo?: string;
    headquarters?: string;
  };

  @Column()
  primary_exchange_market_code?: string;

  @ManyToOne(() => Exchange)
  @JoinColumn()
  exchange?: Exchange;

  @OneToMany(() => Financial, (financial) => financial.stock)
  financials?: Financial[];

  /**
   * TODO: Future Improvements:
   * 1. Add validation for exchanges array structure
   * 2. Implement proper versioning strategy for tracking changes
   * 3. Add support for historical company name changes
   * 4. Consider adding market cap category field
   * 5. Add ESG (Environmental, Social, Governance) data structure
   * 6. Consider adding support for different share classes
   * 7. Add validation rules for metadata fields
   * 8. Implement audit logging for important field changes
   */
}
