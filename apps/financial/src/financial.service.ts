import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from './http.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Financial, FinancialDocument } from './schemas/financial.schema';
import { Stock, StockDocument } from './schemas/stock.schema';
import { UrlIndex, UrlIndexDocument } from './schemas/url-index.schema';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';

const config = {
  maxConcurrentRequests: 3, // Reduced to avoid overloading
  batchDelay: 1000, // Added delay between batches
  maxRetries: 5, // Increased retries
  retryDelay: 3000, // Reduced initial retry delay
  requestTimeout: 30000, // 30 second timeout
  cacheExpiry: 3600000, // 1 hour cache expiry
};

// In-memory cache
const requestCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
  }
>();

interface EPSStockInfo {
  symbol: string;
  companyName: string | null;
  eps: number;
  epsGrowthPercent: number;
  reportDate: string;
}

export interface EPSGrowthResult {
  current: EPSStockInfo;
  previous: EPSStockInfo;
}

interface StockWithMarketCode extends Stock {
  _id: string;
  market_code: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);

  constructor(
    @InjectModel(Financial.name)
    private financialModel: Model<FinancialDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(UrlIndex.name)
    private urlIndexModel: Model<UrlIndexDocument>,
    private readonly httpService: HttpService,
  ) {}

  @MessagePattern({ cmd: 'scrapeFinancialData' })
  async scrapeFinancialData(): Promise<string> {
    this.logger.log('Starting financial data scraping...');
    try {
      await this.fetchAndSaveFinancials();
      this.logger.log('Financial data scraping completed.');
      return 'Financial data scraping completed successfully.';
    } catch (error) {
      this.logger.error(
        `Financial data scraping failed: ${error.message}`,
        error.stack,
      );
      return 'Financial data scraping failed.';
    }
  }

  private async fetchFinancialData(
    stock: StockWithMarketCode,
    retryCount = 0,
  ): Promise<any | null> {
    // Check if URL was already processed
    const stockSymbol = `${stock.market_code}/${stock.symbol}`;
    const urlIndex = await this.urlIndexModel.findOne({
      stock_symbol: stockSymbol,
    });
    if (urlIndex) {
      console.log(`URL already processed for ${stockSymbol}, skipping...`);
      return null;
    }

    const cacheKey = stock.symbol;
    const cachedData = requestCache.get(cacheKey);

    // Return cached data if valid
    if (cachedData && Date.now() - cachedData.timestamp < config.cacheExpiry) {
      console.log(`Using cached data for ${stock.symbol}`);
      return cachedData.data;
    }

    const url = `https://stockanalysis.com/quote/${stock.symbol}/financials/__data.json?p=quarterly&x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=001`;
    console.log(`Fetching data from: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.requestTimeout,
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429 && retryCount < config.maxRetries) {
        // Exponential backoff with jitter
        const dynamicDelay =
          config.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000;
        console.warn(
          `Rate limited for ${stock.symbol}, retrying in ${dynamicDelay}ms...`,
        );
        await sleep(dynamicDelay);
        return this.fetchFinancialData(stock, retryCount + 1);
      }

      if (!response.ok) {
        console.warn(
          `Failed to fetch data for ${stock.market_code}/${stock.symbol}: ${response.statusText}`,
        );
        return null;
      }

      const data = await response.json();

      // Cache successful responses
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error(
          `Timeout fetching data for ${stock.symbol} after ${config.requestTimeout}ms`,
        );
      } else {
        console.error(
          `Error fetching financial data for ${stock.symbol}`,
          error,
        );
      }
      if (retryCount < config.maxRetries) {
        const dynamicDelay = config.retryDelay * Math.pow(2, retryCount);
        console.warn(
          `Retrying fetch for ${stock.symbol} in ${dynamicDelay}ms (attempt ${retryCount + 1})...`,
        );
        await sleep(dynamicDelay);
        return this.fetchFinancialData(stock, retryCount + 1);
      } else {
        return null;
      }
    }
  }

  private processDynamicFinancialData(financialData: any): any[] {
    if (!financialData.nodes || financialData.nodes.length < 3) {
      console.warn('Invalid dynamic financial data structure: missing nodes.');
      return [];
    }
    const d = financialData.nodes[2].data;
    if (!d || !Array.isArray(d)) {
      console.warn(
        'Invalid dynamic financial data structure: missing data array.',
      );
      return [];
    }
    const financialIndex = d[0]?.financialData;
    if (typeof financialIndex !== 'number') {
      console.warn(
        'Invalid dynamic financial data structure: missing financialData index.',
      );
      return [];
    }
    const f = d[financialIndex];
    if (!f || typeof f !== 'object') {
      console.warn(
        'Invalid dynamic financial data structure: missing mapping object.',
      );
      return [];
    }
    const keys = Object.keys(f);
    if (keys.length === 0) {
      console.warn(
        'Invalid dynamic financial data structure: mapping object has no keys.',
      );
      return [];
    }
    const dataMap = keys.reduce(
      (acc, key) => {
        const arr = d[f[key]];
        if (!Array.isArray(arr)) {
          console.warn(
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
      console.warn('No entries found in dynamic financial data.');
      return [];
    }

    return Array.from({ length: numEntries }, (_, i) => {
      const entry: Record<string, any> = {};
      keys.forEach((key) => {
        entry[key] = key === 'fiscalYear' ? +dataMap[key][i] : dataMap[key][i];
      });
      return entry;
    });
  }

  private processFinancialData(
    stock: StockWithMarketCode,
    financialData: any,
  ): any[] {
    if (financialData && financialData.nodes) {
      const combinedList = this.processDynamicFinancialData(financialData);
      if (!combinedList.length) {
        console.warn(
          `Dynamic processing returned no data for ${stock.market_code}/${stock.symbol}`,
        );
        return [];
      }
      return combinedList
        .map((item: any) => {
          const fiscalQuarter = item.fiscalQuarter
            ? parseInt(item.fiscalQuarter.replace(/\D/g, ''), 10)
            : 0;
          const fiscalYear = item.fiscalYear ? Number(item.fiscalYear) : 0;

          // Skip invalid fiscal data
          if (
            !fiscalQuarter ||
            !fiscalYear ||
            fiscalQuarter < 1 ||
            fiscalQuarter > 4 ||
            fiscalYear < 1900 ||
            fiscalYear > new Date().getFullYear()
          ) {
            console.warn(
              `Skipping record with invalid fiscal data: Q${fiscalQuarter} ${fiscalYear}`,
            );
            return null;
          }

          return {
            stock_id: stock._id,
            report_date: new Date(item.datekey),
            fiscal_quarter: fiscalQuarter,
            fiscal_year: fiscalYear,
            revenue: item.revenue ?? null,
            revenue_growth: item.revenueGrowth ?? null,
            operating_income: item.opinc ?? null,
            interest_expense: item.interestExpense ?? null,
            net_income: item.netinc ?? null,
            eps_basic: item.epsBasic ?? null,
            eps_diluted: item.epsdil ?? null,
            free_cash_flow: item.fcf ?? null,
            profit_margin: item.profitMargin ?? null,
            total_operating_expenses: item.opex ?? null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    if (!financialData || financialData.length === 0) {
      console.warn(
        `Invalid financial data for ${stock.market_code}/${stock.symbol}`,
      );
      return [];
    }

    return financialData
      .map((item: any) => {
        if (!item.periodEnding) {
          console.warn(
            `Missing report date for stock ${stock.market_code}/${stock.symbol}, skipping record`,
          );
          return null;
        }

        const fiscalQuarter = item.fiscalQuarter
          ? parseInt(item.fiscalQuarter.replace(/\D/g, ''), 10)
          : 0;
        const fiscalYear = item.fiscalYear ? Number(item.fiscalYear) : 0;

        // Skip invalid fiscal data
        if (
          !fiscalQuarter ||
          !fiscalYear ||
          fiscalQuarter < 1 ||
          fiscalQuarter > 4 ||
          fiscalYear < 1900 ||
          fiscalYear > new Date().getFullYear()
        ) {
          console.warn(
            `Skipping record with invalid fiscal data: Q${fiscalQuarter} ${fiscalYear}`,
          );
          return null;
        }

        return {
          stock_id: stock._id,
          report_date: new Date(item.periodEnding),
          fiscal_quarter: fiscalQuarter,
          fiscal_year: fiscalYear,
          revenue: item.revenue ?? null,
          revenue_growth: item.revenueGrowth ?? null,
          operating_income: item.opinc ?? null,
          interest_expense: item.interestExpense ?? null,
          net_income: item.netinc ?? null,
          eps_basic: item.epsBasic ?? null,
          eps_diluted: item.epsdil ?? null,
          free_cash_flow: item.fcf ?? null,
          profit_margin: item.profitMargin ?? null,
          total_operating_expenses: item.opex ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async getEPSGrowthRanking(
    limit: number = 20,
    skip: number = 0,
  ): Promise<{
    data: EPSGrowthResult[];
    metadata: { total: number; limit: number; skip: number };
  }> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            eps_diluted: { $ne: null },
          },
        } as any,
        {
          $sort: { report_date: -1 },
        } as any,
        {
          $group: {
            _id: '$stock_id',
            latest: { $first: '$$ROOT' },
            previous: { $nth: { $arrayElemAt: ['$report_date', 19] } },
          },
        } as any,
        {
          $lookup: {
            from: 'stocks',
            localField: '_id',
            foreignField: '_id',
            as: 'stock',
          },
        } as any,
        {
          $unwind: '$stock',
        } as any,
        {
          $project: {
            _id: 0,
            current: {
              symbol: '$stock.symbol',
              companyName: '$stock.company_name',
              eps: '$latest.eps_diluted',
              epsGrowthPercent: {
                $cond: [
                  { $ne: ['$previous.eps_diluted', 0] },
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $subtract: [
                              '$latest.eps_diluted',
                              '$previous.eps_diluted',
                            ],
                          },
                          { $abs: '$previous.eps_diluted' },
                        ],
                      },
                      100,
                    ],
                  },
                  null,
                ],
              },
              reportDate: '$latest.report_date',
            },
            previous: {
              symbol: '$stock.symbol',
              companyName: '$stock.company_name',
              eps: '$previous.eps_diluted',
              epsGrowthPercent: 0,
              reportDate: '$previous.report_date',
            },
          },
        } as any,
        {
          $match: {
            'current.epsGrowthPercent': { $ne: null },
          },
        } as any,
        {
          $sort: { 'current.epsGrowthPercent': -1 },
        } as any,
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        } as any,
      ];

      const result = await this.financialModel.aggregate(pipeline);
      const data = result[0].data;
      const total = result[0].total[0]?.count || 0;

      return {
        data,
        metadata: {
          total,
          limit,
          skip,
        },
      };
    } catch (error) {
      console.error('Error calculating EPS growth ranking', error);
      throw error;
    }
  }

  private async saveFinancialData(
    financialData: any,
    stock: StockWithMarketCode,
  ) {
    try {
      if (!stock._id) {
        console.error(
          `Missing stock ID for ${stock.market_code}/${stock.symbol}`,
          new Error('Missing stock ID'),
        );
        return;
      }

      const processedFinancials = this.processFinancialData(
        stock,
        financialData,
      );
      if (!processedFinancials.length) {
        console.warn(
          `No valid financial records to save for ${stock.market_code}/${stock.symbol}`,
        );
        return;
      }

      // Find existing records to avoid duplicates
      const existingRecords = await this.financialModel.find({
        stock_id: stock._id,
      });
      const existingKeys = new Set(
        existingRecords.map(
          (rec) =>
            `${rec.stock_id}|${new Date(rec.report_date).toISOString()}|${rec.fiscal_quarter}|${rec.fiscal_year}`,
        ),
      );

      // Filter and validate records
      const newRecords = processedFinancials.filter((fin) => {
        // Require both fiscal_quarter and fiscal_year to be valid numbers
        const isValidFiscalQuarter =
          Number.isInteger(fin.fiscal_quarter) &&
          fin.fiscal_quarter >= 1 &&
          fin.fiscal_quarter <= 4;

        const isValidFiscalYear =
          Number.isInteger(fin.fiscal_year) &&
          fin.fiscal_year > 1900 &&
          fin.fiscal_year <= new Date().getFullYear();

        // Skip records with missing or invalid fiscal data
        if (!isValidFiscalQuarter || !isValidFiscalYear) {
          console.warn(
            `Skipping record with invalid fiscal data for ${stock.market_code}/${stock.symbol}: Q${fin.fiscal_quarter ?? '?'} ${fin.fiscal_year ?? '???'}`,
          );
          return false;
        }

        // Ensure stock_id is present
        if (!fin.stock_id) {
          console.warn(
            `Skipping record with missing stock_id for ${stock.market_code}/${stock.symbol}`,
          );
          return false;
        }

        const key = `${fin.stock_id}|${new Date(fin.report_date).toISOString()}|${fin.fiscal_quarter}|${fin.fiscal_year}`;
        if (existingKeys.has(key)) {
          console.debug(
            `[Duplicate Prevention] Skipping record for ${stock.market_code}/${stock.symbol}: Q${fin.fiscal_quarter} ${fin.fiscal_year} - Record already exists in database (compound unique index: stock_id + fiscal_quarter + fiscal_year)`,
          );
          return false;
        }

        return true;
      });

      if (newRecords.length) {
        await this.financialModel.insertMany(newRecords);
        newRecords.forEach((rec) =>
          console.log(
            `Saved financial record for ${stock.market_code}/${stock.symbol} on ${rec.report_date}`,
          ),
        );
      } else {
        console.debug(
          `[Status] All financial records up to date for ${stock.market_code}/${stock.symbol} - No new quarters to process`,
        );
      }
    } catch (error) {
      console.error(
        `Error saving financial data for ${stock.market_code}/${stock.symbol}`,
        error,
      );
    }
  }

  async fetchAndSaveFinancials() {
    try {
      let page = 1;
      const pageSize = 100;
      let totalProcessed = 0;

      while (true) {
        const stocks = await this.stockModel
          .find()
          .skip((page - 1) * pageSize)
          .limit(pageSize);

        if (!stocks.length) {
          if (page === 1) throw new Error('No stocks found in database');
          break;
        }

        console.log(
          `Processing page ${page} with ${stocks.length} stocks (Total processed so far: ${totalProcessed})`,
        );

        const stocksWithMarketCode: StockWithMarketCode[] = stocks.map(
          (stock) => ({
            ...stock.toObject(),
            _id: stock._id.toString(),
            market_code: stock.exchanges?.market_code || 'stocks',
          }),
        );

        let index = 0;
        let pageProcessed = 0;

        const processStock = async (stock: StockWithMarketCode) => {
          try {
            const financialData = await this.fetchFinancialData(stock);
            if (financialData) {
              await this.saveFinancialData(financialData, stock);
              // Save URL index after successful processing
              await this.urlIndexModel.create({
                stock_symbol: `${stock.market_code}/${stock.symbol}`,
                last_fetched: new Date(),
              });
              pageProcessed++;
            }
          } catch (error) {
            console.error(`Error processing ${stock.symbol}`, error);
          }
        };

        const worker = async () => {
          while (index < stocksWithMarketCode.length) {
            const currentIndex = index;
            index++;
            const stock = stocksWithMarketCode[currentIndex];
            await processStock(stock);
          }
        };

        const workers: Promise<void>[] = [];
        for (let i = 0; i < config.maxConcurrentRequests; i++) {
          workers.push(worker());
        }
        await Promise.all(workers);

        totalProcessed += pageProcessed;
        console.log(
          `Page ${page} completed. Successfully processed ${pageProcessed} stocks in this page.`,
        );
        page++;

        if (config.batchDelay > 0) {
          console.log(`Waiting ${config.batchDelay}ms before next page...`);
          await sleep(config.batchDelay);
        }
      }

      console.log(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );
    } catch (error) {
      console.error('Fatal error during financial data processing', error);
      throw error;
    }
  }
}
