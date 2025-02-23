import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FinancialDocument = HydratedDocument<Financial>;

@Schema()
export class Financial {
  @Prop()
  symbol: string;

  @Prop()
  date: Date;
}

export const FinancialSchema = SchemaFactory.createForClass(Financial);
