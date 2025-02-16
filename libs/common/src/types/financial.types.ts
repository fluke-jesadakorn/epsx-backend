export interface EPSGrowthResult {
  symbol: string;
  company_name: string;
  market_code: string;
  exchange_name: string;
  eps: number;
  eps_growth: number;
  rank: number;
  last_report_date: string;
}

export interface EPSGrowthResponse {
  data: EPSGrowthResult[];
  metadata: {
    skip: number;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    orderBy: string;
    direction: 'ASC' | 'DESC';
  };
}

export interface FetchState {
  currentPage: number;
  totalProcessed: number;
  lastProcessedStock: string | null;
  lastUpdated: string;
}

export interface WorkerConfig {
  maxConcurrentRequests: number;
  batchDelay: number;
}

export interface IFinancial {
  create_by?: string;
  edit_by?: string;
  delete_by?: string;
  version?: number;
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
  stock: any; // Type will be updated once stock schema is available
}

export interface ProcessedFinancialData {
  fiscalQuarter?: number;
  fiscalYear?: number;
  revenue?: number;
  revenueGrowth?: number;
  operatingIncome?: number;
  interestExpense?: number;
  netIncome?: number;
  epsBasic?: number;
  epsDiluted?: number;
  freeCashFlow?: number;
  profitMargin?: number;
  totalOperatingExpenses?: number;
}
