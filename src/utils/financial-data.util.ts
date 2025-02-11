import { ProcessedFinancialData } from '../types';
import { logger } from './logger';

interface RawFinancialData {
  nodes: Array<{
    data: any[];
  }>;
}

/**
 * Creates an empty financial data object with standard fields
 */
export const initializeProcessedData = (): ProcessedFinancialData => {
  return {
    fiscalQuarter: undefined,
    fiscalYear: undefined,
    revenue: undefined,
    revenueGrowth: undefined,
    operatingIncome: undefined,
    interestExpense: undefined,
    netIncome: undefined,
    epsBasic: undefined,
    epsDiluted: undefined,
    freeCashFlow: undefined,
    profitMargin: undefined,
    totalOperatingExpenses: undefined,
  };
};

/**
 * Validates the financial data structure and returns the data array if valid
 */
const validateFinancialData = (financialData: RawFinancialData): any[] | null => {
  if (!financialData.nodes || financialData.nodes.length < 3) {
    logger.warn('Invalid dynamic financial data structure: missing nodes.');
    return null;
  }
  const data = financialData.nodes[2].data;
  return data;
};

/**
 * Extracts the field mapping from the financial data
 */
const extractFieldMapping = (data: any[]): Record<string, number> | null => {
  const financialIndex = data[0]?.financialData;
  if (typeof financialIndex !== 'number') {
    logger.warn('Invalid dynamic financial data structure: missing financialData index.');
    return null;
  }

  const mapping = data[financialIndex];
  if (!mapping || typeof mapping !== 'object') {
    logger.warn('Invalid dynamic financial data structure: missing mapping object.');
    return null;
  }

  return mapping;
};

// Field transformers for each data type
const fieldTransformers: Record<keyof ProcessedFinancialData, (value: any) => any> = {
  fiscalYear: value => +value,
  fiscalQuarter: value => typeof value === 'string' ? parseInt(value.replace('Q', '')) : +value,
  revenue: value => value,
  revenueGrowth: value => value,
  operatingIncome: value => value,
  interestExpense: value => value,
  netIncome: value => value,
  epsBasic: value => value,
  epsDiluted: value => value,
  freeCashFlow: value => value,
  profitMargin: value => value,
  totalOperatingExpenses: value => value,
};

/**
 * Processes dynamic financial data from a nested structure into a flat array of financial records.
 * @param financialData Raw financial data with nested nodes structure
 * @returns Array of processed financial records with mapped keys and values
 */
export const processDynamicFinancialData = (
  financialData: RawFinancialData,
): ProcessedFinancialData[] => {
  const data = validateFinancialData(financialData);
  if (!data) return [];

  const fieldMapping = extractFieldMapping(data);
  if (!fieldMapping) return [];

  const keys = Object.keys(fieldMapping);
  if (keys.length === 0) {
    logger.warn('Invalid dynamic financial data structure: mapping object has no keys.');
    return [];
  }

  // Create data map with type checking
  const dataMap = keys.reduce<Record<string, any[]>>((acc, key) => {
    const arr = data[fieldMapping[key]];
    if (!Array.isArray(arr)) {
      logger.warn(`Expected array at data[fieldMapping[${key}]] but got undefined or non-array.`);
      acc[key] = [];
    } else {
      acc[key] = arr.map((idx: number) => data[idx]);
    }
    return acc;
  }, {});

  const numEntries = dataMap[keys[0]]?.length || 0;
  if (numEntries === 0) {
    logger.warn('No entries found in dynamic financial data.');
    return [];
  }

  return Array.from({ length: numEntries }, (_, i) => {
    const entry = initializeProcessedData();

    // Apply transformers to map and convert the data
    (Object.keys(fieldTransformers) as Array<keyof ProcessedFinancialData>).forEach(key => {
      if (dataMap[key]?.[i] !== undefined) {
        entry[key] = fieldTransformers[key](dataMap[key][i]);
      }
    });

    return entry;
  });
};
