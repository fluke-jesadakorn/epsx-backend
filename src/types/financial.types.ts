export interface IFinancial {
  revenue?: number;
  revenue_growth?: number;
  operations_maintenance?: number;
  selling_general_admin?: number;
  depreciation_amortization?: number;
  goodwill_amortization?: number;
  bad_debts_provision?: number;
  other_operating_expenses?: number;
  total_operating_expenses?: number;
  operating_income?: number;
  interest_expense?: number;
  interest_income?: number;
  net_interest_expense?: number;
  equity_investments_income?: number;
  currency_exchange_gain?: number;
  other_non_operating_income?: number;
  ebt_excluding_unusual?: number;
  gain_on_sale_investments?: number;
  gain_on_sale_assets?: number;
  asset_writedown?: number;
  insurance_settlements?: number;
  other_unusual_items?: number;
  pretax_income?: number;
  income_tax_expense?: number;
  earnings_continuing_ops?: number;
  minority_interest?: number;
  net_income?: number;
  net_income_common?: number;
  net_income_growth?: number;
  shares_basic?: number;
  shares_diluted?: number;
  eps_basic?: number;
  eps_diluted?: number;
  eps_growth?: number;
  free_cash_flow?: number;
  free_cash_flow_per_share?: number;
  dividend_per_share?: number;
  profit_margin?: number;
  free_cash_flow_margin?: number;
  ebitda?: number;
  ebitda_margin?: number;
  depreciation_amortization_ebitda?: number;
  ebit?: number;
  ebit_margin?: number;
  effective_tax_rate?: number;
  report_date: Date;
  fiscal_quarter: number;
  fiscal_year: number;
}

export interface EPSGrowthResult {
  symbol: string;
  company_name: string;
  market_code: string;
  exchange_name: string;
  eps: number;
  eps_growth: number;
  rank: number;
  last_report_date: Date | null;
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
  company_name: string;
  market_code: string;
  exchange_name: string;
  eps: number;
  eps_growth: number;
  rank: number;
  last_report_date: Date | null;
  growth_percentage: string; // Formatted growth percentage for display
}

export interface ProcessedFinancialData {
  fiscalQuarter: number | undefined;
  fiscalYear: number | undefined;
  revenue: number | undefined;
  revenueGrowth: number | undefined;
  operatingIncome: number | undefined;
  interestExpense: number | undefined;
  netIncome: number | undefined;
  epsBasic: number | undefined;
  epsDiluted: number | undefined;
  freeCashFlow: number | undefined;
  profitMargin: number | undefined;
  totalOperatingExpenses: number | undefined;
}

export interface StockFinancialResponse {
  nodes: Array<{
    data: any[];
  }>;
  eps_growth?: number;
  fiscal_quarter?: string | number;
  fiscal_year?: number;
  revenue?: number;
  revenue_growth?: number;
  operating_income?: number;
  interest_expense?: number;
  net_income?: number;
  eps_basic?: number;
  eps_diluted?: number;
  free_cash_flow?: number;
  profit_margin?: number;
  total_operating_expenses?: number;
  report_date: string;
}

export interface FetchState {
  currentPage: number;
  totalProcessed: number;
  lastProcessedStock: string | null;
  lastUpdated: string;
}

// TODO: Add interfaces for different financial data sources (Yahoo Finance, Bloomberg, etc.)
// TODO: Add interfaces for different financial instruments (bonds, ETFs, etc.)
// TODO: Add interfaces for real-time data streams
// TODO: Add interfaces for financial data validation schemas
