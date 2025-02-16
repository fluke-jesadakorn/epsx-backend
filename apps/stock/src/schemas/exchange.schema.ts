import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Stock } from './stock.schema';

@Schema({ timestamps: true })
export class Exchange extends Document {
  @Prop({ required: true })
  exchange_name: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true, unique: true })
  market_code: string;

  @Prop({ required: true })
  currency: string;

  @Prop()
  exchange_url?: string;

  @Prop({ required: true })
  timezone: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Stock' }] })
  stocks: Stock[];
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
