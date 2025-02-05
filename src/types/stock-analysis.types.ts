export interface StockScreenerResponse {
  data: {
    data: Array<{
      s: string; // symbol
      n: string; // name
      [key: string]: any; // other fields
    }>;
    resultsCount: number;
  };
}

export interface StockFinancialResponse {
  nodes: Array<{
    data: any[];
  }>;
  eps_growth?: number;
  fiscal_quarter?: number;
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
