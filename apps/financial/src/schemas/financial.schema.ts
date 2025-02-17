import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FinancialDocument = Financial & Document;

@Schema({
  timestamps: true,
  collection: 'financials',
})
export class Financial {
  @Prop({ required: true, index: true })
  stock_id: string;

  @Prop({ required: true })
  report_date: Date;

  @Prop({ required: true, index: true })
  fiscal_quarter: number;

  @Prop({ required: true, index: true })
  fiscal_year: number;

  @Prop()
  revenue: number;

  @Prop()
  revenue_growth: number;

  @Prop()
  operating_income: number;

  @Prop()
  interest_expense: number;

  @Prop()
  net_income: number;

  @Prop()
  eps_basic: number;

  @Prop()
  eps_diluted: number;

  @Prop()
  free_cash_flow: number;

  @Prop()
  profit_margin: number;

  @Prop()
  total_operating_expenses: number;
}

export const FinancialSchema = SchemaFactory.createForClass(Financial);

// Create a compound unique index
FinancialSchema.index(
  { stock_id: 1, fiscal_year: 1, fiscal_quarter: 1 },
  { unique: true },
);
