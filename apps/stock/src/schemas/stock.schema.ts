import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Stock {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  symbol: string;

  @ApiProperty()
  @Prop()
  company_name: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Exchange', required: true })
  exchange: Types.ObjectId;

  @ApiProperty()
  @Prop()
  last_updated?: Date;

  // Future props
  // @Prop() market_cap?: number;
  // @Prop() volume?: number;
  // @Prop() pe_ratio?: number;
  // @Prop() dividend_yield?: number;
  // @Prop() price_history?: { date: Date; price: number }[];
}

export const StockSchema = SchemaFactory.createForClass(Stock);
export type StockDocument = Stock & Document;
