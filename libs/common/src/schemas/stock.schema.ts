import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ExchangeDocument } from './exchange.schema';
import { FinancialDocument } from './financial.schema';

export type StockDocument = Stock & Document;

@Schema({ timestamps: true, collection: 'stocks' })
export class Stock {
  @Prop()
  create_by?: string;

  @Prop()
  edit_by?: string;

  @Prop()
  delete_by?: string;

  @Prop({ default: 1 })
  version?: number;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  company_name?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Financial' }],
    default: [],
  })
  financials: FinancialDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  exchange: ExchangeDocument;

  @Prop()
  sector?: string;

  @Prop()
  industry?: string;

  @Prop()
  market_cap?: number;

  @Prop()
  website?: string;

  /**
   * TODO: Future Improvements:
   * - Add stock splits history
   * - Track insider trading
   * - Add ESG ratings
   * - Support multiple share classes
   * - Add corporate actions calendar
   * - Track institutional ownership
   * - Add technical indicators
   * - Support option chain data
   * - Add company news feed
   * - Track analyst recommendations
   */
}

export const StockSchema = SchemaFactory.createForClass(Stock);

export interface StockWithMarketCode extends Stock {
  _id: string;
  market_code: string;
}

// Add indexes
StockSchema.index({ symbol: 1, exchange: 1 }, { unique: true });
StockSchema.index({ company_name: 'text' });
StockSchema.index({ sector: 1 });
StockSchema.index({ industry: 1 });
StockSchema.index({ market_cap: -1 });
