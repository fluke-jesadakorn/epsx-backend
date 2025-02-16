import { Document } from 'mongoose';

export interface Exchange extends Document {
  exchange_name: string;
  country: string;
  market_code: string;
  currency: string;
  exchange_url?: string;
  timezone: string;
}
