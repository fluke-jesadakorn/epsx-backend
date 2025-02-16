import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  exchange_url: string;

  @Prop({ default: 'UTC' })
  timezone: string;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
