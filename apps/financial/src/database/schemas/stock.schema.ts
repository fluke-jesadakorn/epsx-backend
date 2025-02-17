import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Financial } from './financial.schema';

@Schema({
  timestamps: true,
  collection: 'stocks',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Stock extends Document {
  @Prop({ required: true, unique: true, index: true })
  symbol: string;

  @Prop()
  company_name?: string;

  @Prop({
    type: {
      market_code: { type: String, required: true },
    },
  })
  exchange?: {
    market_code: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Financial' }] })
  financials?: Financial[] | Types.ObjectId[];
}

const StockSchema = SchemaFactory.createForClass(Stock);

// Index for faster lookups
StockSchema.index({ 'exchange.market_code': 1 });
StockSchema.index({ company_name: 'text' });

// Virtual for primary market code
StockSchema.virtual('primaryMarketCode').get(function () {
  return this.exchange?.market_code || 'stocks';
});

// Virtual for display name
StockSchema.virtual('displayName').get(function () {
  return this.company_name || this.symbol;
});

export { StockSchema };
