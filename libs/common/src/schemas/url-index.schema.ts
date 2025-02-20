import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UrlIndexDocument = HydratedDocument<UrlIndex>;

@Schema({
  timestamps: true,
  collection: 'url_indices',
})
export class UrlIndex {
  @Prop({ required: true, index: true, unique: true })
  stock_symbol: string; // Store like "otc/ZLNDY"

  @Prop({ required: true })
  last_fetched: Date;
}

export const UrlIndexSchema = SchemaFactory.createForClass(UrlIndex);
