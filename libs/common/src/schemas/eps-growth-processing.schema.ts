import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EPSGrowthProcessingDocument = HydratedDocument<EPSGrowthProcessing>;

@Schema({ timestamps: true })
export class EPSGrowthProcessing {
  @Prop({ required: true, default: 0 })
  totalStocks: number;

  @Prop({ required: true, default: 0 })
  processedStocks: number;

  @Prop({ required: true, default: false })
  isCompleted: boolean;

  @Prop({ required: true, default: Date.now })
  startTime: Date;

  @Prop()
  completedTime?: Date;

  @Prop({ default: null })
  lastProcessedSymbol?: string;

  @Prop({ type: Object, default: null })
  lastAggregationState?: any;

  @Prop({ required: true, default: 'idle' })
  status: 'idle' | 'processing' | 'completed' | 'error';

  @Prop()
  error?: string;
}

export const EPSGrowthProcessingSchema = SchemaFactory.createForClass(EPSGrowthProcessing);
