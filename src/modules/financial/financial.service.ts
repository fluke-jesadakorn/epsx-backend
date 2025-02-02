import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { logger } from '../../utils/logger';
import { DatabaseService } from '../../database/database.service';
import { Stock } from '../../database/types/database.types';

dotenv.config({ path: '../../.env' });

interface StockWithMarketCode extends Stock {
  market_code: string;
}

const config = {
  maxConcurrentRequests: 5, // maximum number of stocks to process concurrently
  batchDelay: 0, // delay between pages (if needed)
  maxRetries: 3,
  retryDelay: 5000, // base delay (ms) for retrying; will be scaled exponentially
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches financial data from the remote URL with dynamic retry and exponential backoff.
 */
async function fetchFinancialData(
  stock: StockWithMarketCode,
  retryCount = 0,
): Promise<any | null> {
  const url = `https://stockanalysis.com/quote/${stock.symbol}/financials/__data.json?p=quarterly&x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=001`;
  logger.info(`Fetching data from: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (response.status === 429 && retryCount < config.maxRetries) {
      const dynamicDelay = config.retryDelay * Math.pow(2, retryCount);
      logger.warn(
        `Rate limited for ${stock.symbol}, retrying in ${dynamicDelay}ms...`,
      );
      await sleep(dynamicDelay);
      return fetchFinancialData(stock, retryCount + 1);
    }

    if (!response.ok) {
      logger.warn(
        `Failed to fetch data for ${stock.market_code}/${stock.symbol}: ${response.statusText}`,
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error(`Error fetching financial data for ${stock.symbol}`, error);
    if (retryCount < config.maxRetries) {
      const dynamicDelay = config.retryDelay * Math.pow(2, retryCount);
      logger.warn(
        `Retrying fetch for ${stock.symbol} in ${dynamicDelay}ms (attempt ${retryCount + 1})...`,
      );
      await sleep(dynamicDelay);
      return fetchFinancialData(stock, retryCount + 1);
    } else {
      return null;
    }
  }
}

/**
 * Processes dynamic financial data using the dynamic key mapping logic.
 */
function processDynamicFinancialData(financialData: any): any[] {
  if (!financialData.nodes || financialData.nodes.length < 3) {
    logger.warn('Invalid dynamic financial data structure: missing nodes.');
    return [];
  }
  const d = financialData.nodes[2].data;
  if (!d || !Array.isArray(d)) {
    logger.warn(
      'Invalid dynamic financial data structure: missing data array.',
    );
    return [];
  }
  const financialIndex = d[0]?.financialData;
  if (typeof financialIndex !== 'number') {
    logger.warn(
      'Invalid dynamic financial data structure: missing financialData index.',
    );
    return [];
  }
  const f = d[financialIndex];
  if (!f || typeof f !== 'object') {
    logger.warn(
      'Invalid dynamic financial data structure: missing mapping object.',
    );
    return [];
  }
  const keys = Object.keys(f);
  if (keys.length === 0) {
    logger.warn(
      'Invalid dynamic financial data structure: mapping object has no keys.',
    );
    return [];
  }
  const dataMap = keys.reduce(
    (acc, key) => {
      const arr = d[f[key]];
      if (!Array.isArray(arr)) {
        logger.warn(
          `Expected array at d[f[${key}]] but got undefined or non-array.`,
        );
        acc[key] = [];
      } else {
        acc[key] = arr.map((idx: number) => d[idx]);
      }
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const numEntries = dataMap[keys[0]]?.length || 0;
  if (numEntries === 0) {
    logger.warn('No entries found in dynamic financial data.');
    return [];
  }

  return Array.from({ length: numEntries }, (_, i) => {
    const entry: Record<string, any> = {};
    keys.forEach((key) => {
      // Convert fiscalYear to a number if needed.
      entry[key] = key === 'fiscalYear' ? +dataMap[key][i] : dataMap[key][i];
    });
    return entry;
  });
}

/**
 * Processes the incoming financial data—using dynamic logic when available,
 * and falling back to legacy mapping otherwise.
 */
function processFinancialData(
  stock: StockWithMarketCode,
  financialData: any,
): any[] {
  // Use dynamic processor if data contains nodes.
  if (financialData && financialData.nodes) {
    const combinedList = processDynamicFinancialData(financialData);
    if (!combinedList.length) {
      logger.warn(
        `Dynamic processing returned no data for ${stock.market_code}/${stock.symbol}`,
      );
      return [];
    }
    // Map dynamic keys to your desired entity structure.
    return combinedList.map((item: any) => ({
      stock_id: stock.id,
      report_date: new Date(item.datekey),
      fiscal_quarter: item.fiscalQuarter
        ? parseInt(item.fiscalQuarter.replace(/\D/g, ''), 10)
        : null,
      fiscal_year: item.fiscalYear ? Number(item.fiscalYear) : null,
      revenue: item.revenue ?? null,
      revenue_growth: item.revenueGrowth ?? null,
      cost_of_revenue: item.cor ?? null,
      gross_profit: item.gp ?? null,
      operating_expenses: item.opex ?? null,
      operating_income: item.opinc ?? null,
      interest_expense: item.interestExpense ?? null,
      net_income: item.netinc ?? null,
      eps_basic: item.epsBasic ?? null,
      eps_diluted: item.epsdil ?? null,
      free_cash_flow: item.fcf ?? null,
      profit_margin: item.profitMargin ?? null,
    }));
  }

  // Fallback legacy processing.
  if (!financialData || financialData.length === 0) {
    logger.warn(
      `Invalid financial data for ${stock.market_code}/${stock.symbol}`,
    );
    return [];
  }
  return financialData
    .map((item: any) => {
      if (!item.periodEnding) {
        logger.warn(
          `Missing report date for stock ${stock.market_code}/${stock.symbol}, skipping record`,
        );
        return null;
      }
      return {
        stock_id: stock.id,
        report_date: new Date(item.periodEnding),
        fiscal_quarter: item.fiscalQuarter
          ? parseInt(item.fiscalQuarter.replace(/\D/g, ''), 10)
          : null,
        fiscal_year: item.fiscalYear ? Number(item.fiscalYear) : null,
        revenue: item.revenue ?? null,
        revenue_growth: item.revenueGrowth ?? null,
        cost_of_revenue: item.cor ?? null,
        gross_profit: item.gp ?? null,
        operating_expenses: item.opex ?? null,
        operating_income: item.opinc ?? null,
        interest_expense: item.interestExpense ?? null,
        net_income: item.netinc ?? null,
        eps_basic: item.epsBasic ?? null,
        eps_diluted: item.epsdil ?? null,
        free_cash_flow: item.fcf ?? null,
        profit_margin: item.profitMargin ?? null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

@Injectable()
export class FinancialService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Saves processed financial data into the database after filtering out duplicates.
   * Duplicate check now uses a composite key (report_date, fiscal_quarter, fiscal_year).
   */
  async saveFinancialData(financialData: any, stock: StockWithMarketCode) {
    try {
      if (!stock.id) {
        logger.error(
          `Missing stock ID for ${stock.market_code}/${stock.symbol}`,
          new Error('Missing stock ID'),
        );
        return;
      }

      const processedFinancials = processFinancialData(stock, financialData);
      if (!processedFinancials.length) {
        logger.warn(
          `No valid financial records to save for ${stock.market_code}/${stock.symbol}`,
        );
        return;
      }

      // Fetch existing records for the stock.
      const existingRecords = await this.db.getFinancialsByStockId(stock.id);
      // Build a Set of composite keys: stock_id|report_date|fiscal_quarter|fiscal_year
      const existingKeys = new Set(
        existingRecords.map(
          (rec: any) =>
            `${rec.stock_id}|${new Date(rec.report_date).toISOString()}|${rec.fiscal_quarter}|${rec.fiscal_year}`,
        ),
      );

      // Validate and filter records
      const newRecords = processedFinancials
        .filter((fin) => {
          // Validate fiscal data
          const isValidFiscalQuarter =
            fin.fiscal_quarter === null ||
            (Number.isInteger(fin.fiscal_quarter) &&
              fin.fiscal_quarter >= 1 &&
              fin.fiscal_quarter <= 4);
          const isValidFiscalYear =
            fin.fiscal_year === null ||
            (Number.isInteger(fin.fiscal_year) &&
              fin.fiscal_year > 1900 &&
              fin.fiscal_year <= new Date().getFullYear());

          if (!isValidFiscalQuarter || !isValidFiscalYear) {
            if (fin.fiscal_quarter !== null || fin.fiscal_year !== null) {
              logger.warn(
                `Invalid fiscal data for ${stock.market_code}/${stock.symbol}: Q${fin.fiscal_quarter ?? '?'} ${fin.fiscal_year ?? '???'}`,
              );
            }
            return false;
          }

          // Check for duplicates using composite key
          const key = `${fin.stock_id}|${new Date(fin.report_date).toISOString()}|${fin.fiscal_quarter}|${fin.fiscal_year}`;
          return !existingKeys.has(key);
        })
        .map((fin) => ({
          stock_id: stock.id,
          report_date: fin.report_date,
          fiscal_quarter: fin.fiscal_quarter,
          fiscal_year: fin.fiscal_year,
          revenue: fin.revenue,
          revenue_growth: fin.revenue_growth,
          operating_income: fin.operating_income,
          interest_expense: fin.interest_expense,
          net_income: fin.net_income,
          eps_basic: fin.eps_basic,
          eps_diluted: fin.eps_diluted,
          free_cash_flow: fin.free_cash_flow,
          profit_margin: fin.profit_margin,
          total_operating_expenses: fin.operating_expenses,
        }));

      if (newRecords.length) {
        await this.db.upsertFinancials(newRecords);
        newRecords.forEach((rec) =>
          logger.info(
            `Saved financial record for ${stock.market_code}/${stock.symbol} on ${rec.report_date}`,
          ),
        );
      } else {
        logger.info(
          `Financial records already exist for ${stock.market_code}/${stock.symbol}`,
        );
      }
    } catch (error) {
      logger.error(
        `Error saving financial data for ${stock.market_code}/${stock.symbol}`,
        error,
      );
    }
  }

  /**
   * Processes stocks concurrently: fetching their financial data dynamically and saving
   * new records to the database, with dynamic retry and wait logic.
   */
  async fetchAndSaveFinancials() {
    try {
      let page = 1;
      const pageSize = 100;
      let totalProcessed = 0;

      while (true) {
        const stocks = (await this.db.getAllStocks(page, pageSize)) as Stock[];
        if (!stocks.length) {
          if (page === 1) throw new Error('No stocks found in database');
          break; // No more stocks to process
        }

        logger.info(
          `Processing page ${page} with ${stocks.length} stocks (Total processed so far: ${totalProcessed})`,
        );

        const stocksWithMarketCode: StockWithMarketCode[] = stocks.map(
          (stock) => ({
            ...stock,
            market_code: stock.exchanges?.market_code || 'stocks',
          }),
        );

        let index = 0;
        let pageProcessed = 0;
        const processStock = async (stock: StockWithMarketCode) => {
          try {
            const financialData = await fetchFinancialData(stock);
            if (financialData) {
              await this.saveFinancialData(financialData, stock);
              pageProcessed++;
            }
          } catch (error) {
            logger.error(`Error processing ${stock.symbol}`, error);
          }
        };

        // Define a worker that will keep pulling stocks until none remain
        const worker = async () => {
          while (index < stocksWithMarketCode.length) {
            const currentIndex = index;
            index++;
            const stock = stocksWithMarketCode[currentIndex];
            await processStock(stock);
          }
        };

        // Launch a pool of concurrent workers
        const workers: Promise<void>[] = [];
        for (let i = 0; i < config.maxConcurrentRequests; i++) {
          workers.push(worker());
        }
        await Promise.all(workers);

        totalProcessed += pageProcessed;
        logger.info(
          `Page ${page} completed. Successfully processed ${pageProcessed} stocks in this page.`,
        );
        page++; // Move to next page

        if (config.batchDelay > 0) {
          logger.info(`Waiting ${config.batchDelay}ms before next page...`);
          await sleep(config.batchDelay);
        }
      }

      logger.info(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );
    } catch (error) {
      logger.error('Fatal error during financial data processing', error);
    }
  }
}
