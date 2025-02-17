import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Stock } from './stock.schema';

@Schema({
  timestamps: true,
  collection: 'financials',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Financial extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Stock', required: true, index: true })
  stock: Stock | Types.ObjectId;

  @Prop({ required: true, index: true })
  report_date: Date;

  @Prop({ required: true, min: 1, max: 4, index: true })
  fiscal_quarter: number;

  @Prop({ required: true, index: true })
  fiscal_year: number;

  @Prop()
  revenue?: number;

  @Prop()
  revenue_growth?: number;

  @Prop()
  operating_income?: number;

  @Prop()
  interest_expense?: number;

  @Prop()
  net_income?: number;

  @Prop({ index: true })
  eps_basic?: number;

  @Prop()
  eps_diluted?: number;

  @Prop()
  free_cash_flow?: number;

  @Prop()
  profit_margin?: number;

  @Prop()
  total_operating_expenses?: number;

  // Compound index for uniqueness
  @Prop()
  stockQuarterYear: string;
}

// Create compound index for unique stock-quarter-year combination
const FinancialSchema = SchemaFactory.createForClass(Financial);
FinancialSchema.index(
  { stock: 1, fiscal_quarter: 1, fiscal_year: 1 },
  { unique: true },
);

// Virtual for full period identifier
FinancialSchema.virtual('periodId').get(function () {
  return `${this.fiscal_year}Q${this.fiscal_quarter}`;
});

// Middleware to set stockQuarterYear before save
FinancialSchema.pre('save', function (next) {
  this.stockQuarterYear = `${this.stock}-${this.fiscal_year}Q${this.fiscal_quarter}`;
  next();
});

export { FinancialSchema };
