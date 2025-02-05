import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Stock } from './stock.entity';
import { CommonEntity } from './common.entity';

@Entity('financials')
@Index(['stock', 'report_date'])
@Index(['report_date'])
@Index(['stock', 'fiscal_year', 'fiscal_quarter'])
@Index(['eps_diluted', 'report_date'])
@Index(['net_income', 'report_date'])
@Index(['revenue', 'report_date'])
export class Financial extends CommonEntity {
  @Column({ nullable: true })
  revenue?: number;

  @Column({ nullable: true })
  revenue_growth?: number;

  @Column({ nullable: true })
  operations_maintenance?: number;

  @Column({ nullable: true })
  selling_general_admin?: number;

  @Column({ nullable: true })
  depreciation_amortization?: number;

  @Column({ nullable: true })
  goodwill_amortization?: number;

  @Column({ nullable: true })
  bad_debts_provision?: number;

  @Column({ nullable: true })
  other_operating_expenses?: number;

  @Column({ nullable: true })
  total_operating_expenses?: number;

  @Column({ nullable: true })
  operating_income?: number;

  @Column({ nullable: true })
  interest_expense?: number;

  @Column({ nullable: true })
  interest_income?: number;

  @Column({ nullable: true })
  net_interest_expense?: number;

  @Column({ nullable: true })
  equity_investments_income?: number;

  @Column({ nullable: true })
  currency_exchange_gain?: number;

  @Column({ nullable: true })
  other_non_operating_income?: number;

  @Column({ nullable: true })
  ebt_excluding_unusual?: number;

  @Column({ nullable: true })
  gain_on_sale_investments?: number;

  @Column({ nullable: true })
  gain_on_sale_assets?: number;

  @Column({ nullable: true })
  asset_writedown?: number;

  @Column({ nullable: true })
  insurance_settlements?: number;

  @Column({ nullable: true })
  other_unusual_items?: number;

  @Column({ nullable: true })
  pretax_income?: number;

  @Column({ nullable: true })
  income_tax_expense?: number;

  @Column({ nullable: true })
  earnings_continuing_ops?: number;

  @Column({ nullable: true })
  minority_interest?: number;

  @Column({ nullable: true })
  net_income?: number;

  @Column({ nullable: true })
  net_income_common?: number;

  @Column({ nullable: true })
  net_income_growth?: number;

  @Column({ nullable: true })
  shares_basic?: number;

  @Column({ nullable: true })
  shares_diluted?: number;

  @Column({ nullable: true })
  eps_basic?: number;

  @Column({ nullable: true })
  eps_diluted?: number;

  @Column({ nullable: true })
  eps_growth?: number;

  @Column({ nullable: true })
  free_cash_flow?: number;

  @Column({ nullable: true })
  free_cash_flow_per_share?: number;

  @Column({ nullable: true })
  dividend_per_share?: number;

  @Column({ nullable: true })
  profit_margin?: number;

  @Column({ nullable: true })
  free_cash_flow_margin?: number;

  @Column({ nullable: true })
  ebitda?: number;

  @Column({ nullable: true })
  ebitda_margin?: number;

  @Column({ nullable: true })
  depreciation_amortization_ebitda?: number;

  @Column({ nullable: true })
  ebit?: number;

  @Column({ nullable: true })
  ebit_margin?: number;

  @Column({ nullable: true })
  effective_tax_rate?: number;

  @Column()
  report_date: Date;

  @Column()
  fiscal_quarter: string;

  @Column()
  fiscal_year: number;

  @ManyToOne(() => Stock, (stock) => stock.financials, { nullable: false })
  @JoinColumn()
  stock: Stock;
}
