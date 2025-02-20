// Types for financial data aggregation and analysis

export interface EpsGrowthData {
  symbol: string;
  company_name: string;
  market_code: string;
  eps: number;
  eps_growth: number;
  rank: number;
  last_report_date: string;
}

export interface QuarterData {
  quarter: number;
  year: number;
  eps: number;
  eps_growth: number;
  report_date: string;
}

export interface ThreeQuarterEPSGrowth {
  symbol: string;
  company_name: string;
  market_code: string;
  quarters: QuarterData[];
  average_growth: number;
}

export interface EPSPriceGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  price_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}

export interface EPSVolumeGrowth {
  symbol: string;
  company_name: string;
  eps_growth: number;
  volume_growth: number;
  correlation: number;
  period_start: string;
  period_end: string;
}

// Note: Scraping-related types have been moved to scheduler service
// See: apps/scheduler-service/src/types/scheduler.types.ts
