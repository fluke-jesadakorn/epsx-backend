import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type EpsGrowthDocument = HydratedDocument<EpsGrowth>;

@Schema({ timestamps: true })
export class EpsGrowth {
  @Prop({ required: true, index: true })
  symbol: string;

  @Prop({ required: true })
  company_name: string;

  @Prop({ required: true, index: true })
  market_code: string;

  @Prop({ required: true })
  eps_diluted: number;

  @Prop({ required: true })
  previous_eps_diluted: number;

  @Prop({ required: true, index: true })
  eps_growth: number;

  @Prop({ required: true })
  report_date: Date;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  quarter: number;
}

export const EpsGrowthSchema = SchemaFactory.createForClass(EpsGrowth);

// Create indexes for efficient querying and sorting
EpsGrowthSchema.index({ eps_growth: -1, symbol: 1 }); // Main ranking index
EpsGrowthSchema.index({ market_code: 1, eps_growth: -1 }); // Market-specific ranking
EpsGrowthSchema.index({ year: -1, quarter: -1 }); // Time-based queries
EpsGrowthSchema.index({ symbol: 1, year: -1, quarter: -1 }); // Symbol-specific historical data
EpsGrowthSchema.index({ report_date: -1 }); // Date-based queries

// TODO: Future features
// 1. Add market_cap and volume metrics
// 2. Add sector/industry filtering
// 3. Add year-over-year comparison
// 4. Add momentum indicators
