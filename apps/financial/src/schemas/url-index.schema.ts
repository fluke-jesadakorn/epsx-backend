import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UrlIndexDocument = UrlIndex & Document;

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
