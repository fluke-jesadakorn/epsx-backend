import { ProcessedFinancialData } from '../types/financial.types';

export function processDynamicFinancialData(response: any): ProcessedFinancialData[] {
  if (!response || !response.nodes) {
    return [];
  }

  const processedData: ProcessedFinancialData[] = [];

  // Process each node from the response
  response.nodes.forEach((node: any) => {
    if (!node.data || !Array.isArray(node.data)) {
      return;
    }

    // Process each data item within the node
    node.data.forEach((item: any) => {
      const financialData: ProcessedFinancialData = {
        fiscalQuarter: extractQuarter(item.fiscal_quarter),
        fiscalYear: extractYear(item.fiscal_year),
        revenue: normalizeNumber(item.revenue),
        revenueGrowth: normalizeNumber(item.revenue_growth),
        operatingIncome: normalizeNumber(item.operating_income),
        interestExpense: normalizeNumber(item.interest_expense),
        netIncome: normalizeNumber(item.net_income),
        epsBasic: normalizeNumber(item.eps_basic),
        epsDiluted: normalizeNumber(item.eps_diluted),
        freeCashFlow: normalizeNumber(item.free_cash_flow),
        profitMargin: normalizeNumber(item.profit_margin),
        totalOperatingExpenses: normalizeNumber(item.total_operating_expenses),
      };

      // Only add valid entries
      if (isValidFinancialData(financialData)) {
        processedData.push(financialData);
      }
    });
  });

  // Sort by fiscal year and quarter in descending order
  return processedData.sort((a, b) => {
    if (a.fiscalYear !== b.fiscalYear) {
      return (b.fiscalYear || 0) - (a.fiscalYear || 0);
    }
    return (b.fiscalQuarter || 0) - (a.fiscalQuarter || 0);
  });
}

function extractQuarter(quarter: string | number | null): number | undefined {
  if (typeof quarter === 'number') {
    return quarter >= 1 && quarter <= 4 ? quarter : undefined;
  }
  if (typeof quarter === 'string') {
    const match = quarter.match(/Q(\d)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return num >= 1 && num <= 4 ? num : undefined;
    }
  }
  return undefined;
}

function extractYear(year: string | number | null): number | undefined {
  if (typeof year === 'number') {
    return year > 1900 && year < 2100 ? year : undefined;
  }
  if (typeof year === 'string') {
    const num = parseInt(year, 10);
    return num > 1900 && num < 2100 ? num : undefined;
  }
  return undefined;
}

function normalizeNumber(value: any): number | undefined {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) ? num : undefined;
  }
  return undefined;
}

function isValidFinancialData(data: ProcessedFinancialData): boolean {
  // Must have at least fiscal quarter and year
  if (!data.fiscalQuarter || !data.fiscalYear) {
    return false;
  }

  // Must have at least one financial metric
  return [
    data.revenue,
    data.operatingIncome,
    data.netIncome,
    data.epsBasic,
    data.epsDiluted,
  ].some(metric => metric !== undefined);
}

// TODO: Implement data validation for specific metrics
// TODO: Add support for different time period comparisons
// TODO: Implement data normalization across different currencies
// TODO: Add support for different accounting standards
// TODO: Implement outlier detection for financial metrics
// TODO: Add data quality scoring
// TODO: Implement trend analysis functions
// TODO: Add support for sector-specific metrics
// TODO: Implement ratio calculations
// TODO: Add historical comparison functions
