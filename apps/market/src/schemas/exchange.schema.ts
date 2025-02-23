import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExchangeDocument = HydratedDocument<Exchange>;

@Schema()
export class Exchange {
  @Prop({ required: true, unique: true })
  market_code: string;

  @Prop({ required: true })
  exchange_name: string;

  @Prop()
  country: string;

  @Prop()
  currency: string;

  @Prop()
  exchange_url: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ type: [{ type: String, ref: 'Stock' }] })
  stocks: string[];
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
