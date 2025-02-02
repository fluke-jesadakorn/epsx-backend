import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Exchange } from "./exchange.entity";
import { Financial } from "./financial.entity";

@Entity("stocks")
export class Stock {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  symbol: string;

  @Column()
  company_name: string;

  @Column({ type: "uuid" })
  exchange_id: string;

  @Column()
  market_code: string;

  @Column()
  exchange_name: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  stocks: string;

  @Column({ nullable: true })
  exchange_url: string;

  @ManyToOne(() => Exchange, (exchange) => exchange.stocks_relation)
  @JoinColumn({ name: "exchange_id" })
  exchange?: Exchange;

  @OneToMany(() => Financial, (financial) => financial.stock)
  financials?: Financial[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
