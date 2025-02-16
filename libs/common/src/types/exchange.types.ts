import { Document } from 'mongoose';

export interface Stock extends Document {
  symbol: string;
  company_name: string;
  exchange: Exchange;
  last_updated?: Date;
}

export interface Exchange extends Document {
  market_code: string;
  exchange_name: string;
  country: string;
  timezone: string;
  open_time?: string;
  close_time?: string;
  stocks: Stock[];
  last_updated: Date;
  is_active: boolean;
}

export interface ExchangeResponse {
  id: string;
  market_code: string;
  exchange_name: string;
  country: string;
  timezone: string;
  open_time?: string;
  close_time?: string;
  last_updated: Date;
  is_active: boolean;
  stocks_count?: number;
}

// TODO: Future enhancements
// - Add support for market holidays
// - Add support for multiple trading sessions
// - Add exchange-specific configuration options
// - Add market status indicators
// - Add exchange performance metrics
