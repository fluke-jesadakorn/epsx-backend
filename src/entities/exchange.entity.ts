import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Stock } from './stock.entity';

@Entity('exchanges')
export class Exchange {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  market_code: string;

  @Column()
  exchange_name: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  stocks?: string;

  @Column({ nullable: true })
  exchange_url?: string;

  @OneToMany(() => Stock, (stock) => stock.exchange)
  stocks_relation?: Stock[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
