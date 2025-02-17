import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema({
  timestamps: true,
  collection: 'stocks',
})
export class Stock {
  @Prop({ required: true, unique: true })
  symbol: string;

  @Prop()
  company_name: string;

  @Prop({ type: Object })
  exchanges: {
    market_code: string;
  };
}

export const StockSchema = SchemaFactory.createForClass(Stock);
