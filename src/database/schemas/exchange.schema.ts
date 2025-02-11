import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Stock } from './stock.schema';

@Schema({ timestamps: true, collection: 'exchanges' })
export class Exchange extends Document {
  @Prop()
  create_by?: string;

  @Prop()
  edit_by?: string;

  @Prop()
  delete_by?: string;

  @Prop({ default: 1 })
  version?: number;

  @Prop({ required: true })
  market_code: string;

  @Prop({ required: true })
  exchange_name: string;

  @Prop()
  description?: string;

  @Prop()
  region?: string;

  @Prop()
  timezone?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Stock' }] })
  stocks: Stock[];

  /**
   * TODO: Future Improvements:
   * - Add trading hours support
   * - Add market holidays calendar
   * - Support multiple currencies
   * - Add market status (open/closed)
   * - Add real-time price updates support
   * - Add market indices tracking
   * - Support different order types
   * - Add market maker information
   * - Support cross-exchange arbitrage
   */
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);

// Add indexes
ExchangeSchema.index({ market_code: 1 }, { unique: true });
ExchangeSchema.index({ exchange_name: 1 });
ExchangeSchema.index({ region: 1 });
