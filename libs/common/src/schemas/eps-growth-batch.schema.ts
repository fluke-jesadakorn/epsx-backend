import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { EPSGrowthProcessing } from './eps-growth-processing.schema';

export type EPSGrowthBatchDocument = HydratedDocument<EPSGrowthBatch>;

@Schema({ timestamps: true })
export class EPSGrowthBatch {
  @Prop({ type: SchemaTypes.ObjectId, ref: EPSGrowthProcessing.name, required: true })
  processingId: EPSGrowthProcessing;

  @Prop({ required: true })
  batchNumber: number;

  @Prop({ required: true })
  symbols: string[];

  @Prop({ type: [{
    symbol: String,
    company_name: String,
    market_code: String,
    eps: Number,
    eps_growth: Number,
    rank: Number,
    last_report_date: String
  }], default: [] })
  results: {
    symbol: string;
    company_name: string;
    market_code: string;
    eps: number;
    eps_growth: number;
    rank: number;
    last_report_date: string;
  }[];

  @Prop({ required: true, default: false })
  isProcessed: boolean;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'error';

  @Prop()
  error?: string;
}

export const EPSGrowthBatchSchema = SchemaFactory.createForClass(EPSGrowthBatch);

// Create indexes for efficient querying
EPSGrowthBatchSchema.index({ processingId: 1, batchNumber: 1 });
EPSGrowthBatchSchema.index({ processingId: 1, status: 1 });
