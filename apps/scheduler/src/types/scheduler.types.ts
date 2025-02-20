export interface StockWithMarketCode {
  _id: string;
  symbol: string;
  market_code: string;
  [key: string]: any;
}

export interface FinancialRecord {
  stock: string;
  report_date: Date;
  fiscal_quarter: number;
  fiscal_year: number;
  revenue: number | null;
  revenue_growth: number | null;
  operating_income: number | null;
  interest_expense: number | null;
  net_income: number | null;
  eps_basic: number | null;
  eps_diluted: number | null;
  free_cash_flow: number | null;
  profit_margin: number | null;
  total_operating_expenses: number | null;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}
