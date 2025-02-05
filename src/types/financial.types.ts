export interface EPSGrowthResult {
  symbol: string;
  eps_growth: number;
  rank: number;
}

export interface WorkerConfig {
  maxConcurrentRequests: number;
  batchDelay: number;
}

export interface StockWithMarketCode {
  _id: string;
  symbol: string;
  company_name: string | null;
  market_code: string;
  exchanges: { market_code: string; primary: boolean }[];
}

export interface EPSGrowthData {
  symbol: string;
  eps_growth: number;
  has_financial_data: boolean;
  last_report_date: Date | null;
}

export interface ProcessedFinancialData {
  [key: string]: any;
}
