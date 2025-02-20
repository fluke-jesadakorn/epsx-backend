import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import type { Stock } from './stock.schema';

export type ExchangeDocument = HydratedDocument<Exchange>;
@Schema({ timestamps: true, collection: 'exchanges' })
export class Exchange {
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
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);

// Add indexes
ExchangeSchema.index({ market_code: 1 }, { unique: true });
ExchangeSchema.index({ exchange_name: 1 });
ExchangeSchema.index({ region: 1 });
