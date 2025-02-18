import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EpsGrowthDocument = EpsGrowth & Document;

@Schema({ timestamps: true })
export class EpsGrowth {
  @Prop({ required: true, index: true })
  symbol: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true, index: true })
  market_code: string;

  @Prop({ required: true })
  eps: number;

  @Prop({ required: true, index: true })
  eps_growth: number;

  @Prop({ required: true })
  rank: number;

  @Prop({ required: true })
  last_report_date: string;
}

export const EpsGrowthSchema = SchemaFactory.createForClass(EpsGrowth);

// Create compound index for efficient sorting and filtering
EpsGrowthSchema.index({ eps_growth: -1, symbol: 1 });

// TODO: Future features
// 1. Add market_code filtering capability
// 2. Add date range filtering for historical comparisons
// 3. Add sorting direction options (asc/desc)
// 4. Consider adding additional financial metrics like:
//    - PE ratio
//    - Market cap
//    - Revenue growth
//    - Profit margin
