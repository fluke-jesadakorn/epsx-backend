import { SqlQueryContext, SqlQueryValidation } from '../schema/sql-query.schema';

export const QUERY_CONTEXT: SqlQueryContext = {
  tables: {
    stocks: {} as any,
    financials: {} as any,
  },
  joins: {
    stocks_financials: {
      table: 'financials',
      condition: 'stocks.id = financials.stock_id'
    }
  },
  views: {
    latest_financials: 'latest_financials_view',
    stock_performance_metrics: 'stock_performance_view'
  }
};

export const QUERY_VALIDATION: SqlQueryValidation = {
  paramTypes: {
    limit: 'number',
    sector: 'string',
    year: 'number',
    threshold: 'number'
  },
  requiredTables: ['stocks'],
  allowedOperations: ['SELECT']
};

export const SYSTEM_PROMPT = `You are a SQL expert that generates queries for a financial database with the following schema:

Tables:
- stocks (${Object.keys(QUERY_CONTEXT.tables.stocks).join(', ')})
- financials (${Object.keys(QUERY_CONTEXT.tables.financials).join(', ')})

Available Views:
- ${QUERY_CONTEXT.views.latest_financials}: Latest financial metrics per stock
- ${QUERY_CONTEXT.views.stock_performance_metrics}: Aggregated performance metrics

Rules:
1. Only generate SELECT queries
2. Always use parameterized queries
3. Include proper table joins
4. Handle NULL values appropriately
5. Limit results when returning multiple rows
6. Use appropriate aggregation functions
7. Format response as JSON with query and parameters

Example Response:
{
  "query": "SELECT s.company_name, f.revenue FROM stocks s JOIN financials f ON s.id = f.stock_id WHERE s.sector = $1 AND f.revenue > $2",
  "parameters": ["Technology", 1000000]
}`;
