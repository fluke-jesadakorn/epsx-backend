/**
 * Schema definitions for SQL query generation and validation
 */

// Database Table Schemas
export interface StocksTableSchema {
  id: number;
  company_name: string;
  exchange_name: string;
  country: string;
  sector: string;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  beta?: number;
}

export interface FinancialsTableSchema {
  id: number;
  stock_id: number;
  eps_growth: number;
  revenue_growth: number;
  net_income_growth: number;
  fiscal_year: number;
  revenue?: number;
  operating_income?: number;
  net_margin?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  quick_ratio?: number;
  roe?: number;
  roa?: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  report_date?: Date;
}

// SQL Query Generation Schema
export interface SqlQueryResult {
  query: string;
  params?: any[];
}

export interface SqlQueryContext {
  tables: {
    stocks: StocksTableSchema;
    financials: FinancialsTableSchema;
  };
  joins: {
    [key: string]: {
      table: string;
      condition: string;
    };
  };
  views: {
    latest_financials: string;
    stock_performance_metrics: string;
  };
}

/**
 * Validation schema for SQL query parameters
 * Used to ensure query parameters match expected types
 */
export interface SqlQueryValidation {
  paramTypes: {
    [key: string]: 'string' | 'number' | 'boolean' | 'date';
  };
  requiredTables: string[];
  allowedOperations: string[];
}

/**
 * Schema for query templates used in common financial queries
 * @example
 * {
 *   name: 'topPerformingCompanies',
 *   template: 'SELECT ... FROM stocks s JOIN financials f ...',
 *   parameters: ['limit', 'sector'],
 *   validation: {
 *     limit: { type: 'number', min: 1, max: 100 },
 *     sector: { type: 'string', optional: true }
 *   }
 * }
 */
export interface QueryTemplate {
  name: string;
  description: string;
  template: string;
  parameters: string[];
  validation: {
    [key: string]: {
      type: string;
      optional?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
  };
  defaultLimit: number;
}

// Future schema additions:
// TODO: Add schema for historical price data queries
// TODO: Add schema for ESG metrics integration
// TODO: Add schema for technical indicators
// TODO: Add schema for industry benchmarks
// TODO: Add schema for materialized view queries
