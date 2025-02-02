import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Stock } from "./stock.entity";

// Using string-based reference to resolve circular dependency with Stock entity
@Entity("financials")
export class Financial {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "uuid" })
  stock_id: string;

  @Column({ type: "decimal", nullable: true })
  revenue?: number;

  @Column({ type: "decimal", nullable: true })
  revenue_growth?: number;

  @Column({ type: "decimal", nullable: true })
  operations_maintenance?: number;

  @Column({ type: "decimal", nullable: true })
  selling_general_admin?: number;

  @Column({ type: "decimal", nullable: true })
  depreciation_amortization?: number;

  @Column({ type: "decimal", nullable: true })
  goodwill_amortization?: number;

  @Column({ type: "decimal", nullable: true })
  bad_debts_provision?: number;

  @Column({ type: "decimal", nullable: true })
  other_operating_expenses?: number;

  @Column({ type: "decimal", nullable: true })
  total_operating_expenses?: number;

  @Column({ type: "decimal", nullable: true })
  operating_income?: number;

  @Column({ type: "decimal", nullable: true })
  interest_expense?: number;

  @Column({ type: "decimal", nullable: true })
  interest_income?: number;

  @Column({ type: "decimal", nullable: true })
  net_interest_expense?: number;

  @Column({ type: "decimal", nullable: true })
  equity_investments_income?: number;

  @Column({ type: "decimal", nullable: true })
  currency_exchange_gain?: number;

  @Column({ type: "decimal", nullable: true })
  other_non_operating_income?: number;

  @Column({ type: "decimal", nullable: true })
  ebt_excluding_unusual?: number;

  @Column({ type: "decimal", nullable: true })
  gain_on_sale_investments?: number;

  @Column({ type: "decimal", nullable: true })
  gain_on_sale_assets?: number;

  @Column({ type: "decimal", nullable: true })
  asset_writedown?: number;

  @Column({ type: "decimal", nullable: true })
  insurance_settlements?: number;

  @Column({ type: "decimal", nullable: true })
  other_unusual_items?: number;

  @Column({ type: "decimal", nullable: true })
  pretax_income?: number;

  @Column({ type: "decimal", nullable: true })
  income_tax_expense?: number;

  @Column({ type: "decimal", nullable: true })
  earnings_continuing_ops?: number;

  @Column({ type: "decimal", nullable: true })
  minority_interest?: number;

  @Column({ type: "decimal", nullable: true })
  net_income?: number;

  @Column({ type: "decimal", nullable: true })
  net_income_common?: number;

  @Column({ type: "decimal", nullable: true })
  net_income_growth?: number;

  @Column({ type: "decimal", nullable: true })
  shares_basic?: number;

  @Column({ type: "decimal", nullable: true })
  shares_diluted?: number;

  @Column({ type: "decimal", nullable: true })
  eps_basic?: number;

  @Column({ type: "decimal", nullable: true })
  eps_diluted?: number;

  @Column({ type: "decimal", nullable: true })
  eps_growth?: number;

  @Column({ type: "decimal", nullable: true })
  free_cash_flow?: number;

  @Column({ type: "decimal", nullable: true })
  free_cash_flow_per_share?: number;

  @Column({ type: "decimal", nullable: true })
  dividend_per_share?: number;

  @Column({ type: "decimal", nullable: true })
  profit_margin?: number;

  @Column({ type: "decimal", nullable: true })
  free_cash_flow_margin?: number;

  @Column({ type: "decimal", nullable: true })
  ebitda?: number;

  @Column({ type: "decimal", nullable: true })
  ebitda_margin?: number;

  @Column({ type: "decimal", nullable: true })
  depreciation_amortization_ebitda?: number;

  @Column({ type: "decimal", nullable: true })
  ebit?: number;

  @Column({ type: "decimal", nullable: true })
  ebit_margin?: number;

  @Column({ type: "decimal", nullable: true })
  effective_tax_rate?: number;

  @Column({ type: "timestamptz" })
  report_date: Date;

  @Column()
  fiscal_quarter: string;

  @Column()
  fiscal_year: number;

  @ManyToOne(() => Stock, (stock) => stock.financials)
  @JoinColumn({ name: "stock_id" })
  stock?: Stock;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
