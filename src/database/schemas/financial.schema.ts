import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IFinancial } from '../../types/financial.types';
import { Stock } from './stock.schema';

@Schema({
  timestamps: true, // This replaces createdAt and updatedAt from CommonEntity
  collection: 'financials',
})
export class Financial extends Document implements IFinancial {
  @Prop()
  create_by?: string;

  @Prop()
  edit_by?: string;

  @Prop()
  delete_by?: string;

  @Prop({ default: 1 })
  version?: number;

  @Prop({ type: Number })
  revenue?: number;

  @Prop({ type: Number })
  revenue_growth?: number;

  @Prop({ type: Number })
  operations_maintenance?: number;

  @Prop({ type: Number })
  selling_general_admin?: number;

  @Prop({ type: Number })
  depreciation_amortization?: number;

  @Prop({ type: Number })
  goodwill_amortization?: number;

  @Prop({ type: Number })
  bad_debts_provision?: number;

  @Prop({ type: Number })
  other_operating_expenses?: number;

  @Prop({ type: Number })
  total_operating_expenses?: number;

  @Prop({ type: Number })
  operating_income?: number;

  @Prop({ type: Number })
  interest_expense?: number;

  @Prop({ type: Number })
  interest_income?: number;

  @Prop({ type: Number })
  net_interest_expense?: number;

  @Prop({ type: Number })
  equity_investments_income?: number;

  @Prop({ type: Number })
  currency_exchange_gain?: number;

  @Prop({ type: Number })
  other_non_operating_income?: number;

  @Prop({ type: Number })
  ebt_excluding_unusual?: number;

  @Prop({ type: Number })
  gain_on_sale_investments?: number;

  @Prop({ type: Number })
  gain_on_sale_assets?: number;

  @Prop({ type: Number })
  asset_writedown?: number;

  @Prop({ type: Number })
  insurance_settlements?: number;

  @Prop({ type: Number })
  other_unusual_items?: number;

  @Prop({ type: Number })
  pretax_income?: number;

  @Prop({ type: Number })
  income_tax_expense?: number;

  @Prop({ type: Number })
  earnings_continuing_ops?: number;

  @Prop({ type: Number })
  minority_interest?: number;

  @Prop({ type: Number })
  net_income?: number;

  @Prop({ type: Number })
  net_income_common?: number;

  @Prop({ type: Number })
  net_income_growth?: number;

  @Prop({ type: Number })
  shares_basic?: number;

  @Prop({ type: Number })
  shares_diluted?: number;

  @Prop({ type: Number })
  eps_basic?: number;

  @Prop({ type: Number })
  eps_diluted?: number;

  @Prop({ type: Number })
  eps_growth?: number;

  @Prop({ type: Number })
  free_cash_flow?: number;

  @Prop({ type: Number })
  free_cash_flow_per_share?: number;

  @Prop({ type: Number })
  dividend_per_share?: number;

  @Prop({ type: Number })
  profit_margin?: number;

  @Prop({ type: Number })
  free_cash_flow_margin?: number;

  @Prop({ type: Number })
  ebitda?: number;

  @Prop({ type: Number })
  ebitda_margin?: number;

  @Prop({ type: Number })
  depreciation_amortization_ebitda?: number;

  @Prop({ type: Number })
  ebit?: number;

  @Prop({ type: Number })
  ebit_margin?: number;

  @Prop({ type: Number })
  effective_tax_rate?: number;

  @Prop({ required: true, type: Date })
  report_date: Date;

  @Prop({ required: true, type: Number })
  fiscal_quarter: number;

  @Prop({ required: true, type: Number })
  fiscal_year: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Stock', required: true })
  stock: Stock;

  /**
   * TODO: Future Improvements:
   * - Add support for different accounting standards (GAAP/IFRS)
   * - Include segment reporting data
   * - Add cash flow statement metrics
   * - Support multiple currencies and currency conversion
   * - Add analyst estimates comparison
   * - Track revision history of financial statements
   * - Include non-GAAP measures
   * - Add financial ratio calculations
   * - Support quarterly and annual data comparison
   * - Add data quality validation rules
   * 
   * Infrastructure Improvements:
   * - Add soft delete functionality
   * - Implement audit logging for all changes
   * - Add support for optimistic locking using version field
   * - Consider adding tenant ID for multi-tenant support
   * - Add validation decorators for common fields
   * - Implement proper type safety for ObjectId fields
   * - Add migration strategy for schema changes
   * - Consider distributed ID generation
   */
}

export const FinancialSchema = SchemaFactory.createForClass(Financial);

// Add indexes for common queries and relationships
FinancialSchema.index({ stock: 1, report_date: -1 }); // Latest financials by stock
FinancialSchema.index({ report_date: -1 }); // Latest financials overall
FinancialSchema.index({ stock: 1, fiscal_year: -1, fiscal_quarter: -1 }); // Latest quarters by stock
FinancialSchema.index({ eps_diluted: 1, report_date: -1 }); // EPS tracking
FinancialSchema.index({ net_income: 1, report_date: -1 }); // Income tracking
FinancialSchema.index({ revenue: 1, report_date: -1 }); // Revenue tracking
FinancialSchema.index({ stock: 1, fiscal_year: 1, fiscal_quarter: 1 }, { unique: true, background: true }); // Ensure unique financial records per stock per quarter
FinancialSchema.index({ stock: 1, fiscal_year: 1 }); // Annual reports
FinancialSchema.index({ ebitda_margin: 1 }); // Performance metrics
FinancialSchema.index({ eps_basic: 1 }); // For EPS basic sorting
FinancialSchema.index({ stock: 1, eps_basic: 1 }); // For EPS calculations per stock
FinancialSchema.index({ eps_basic_growth: -1 }); // For EPS growth sorting and ranking
