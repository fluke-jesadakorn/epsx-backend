import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exchange, Stock, Financial, EpsGrowth } from '@market/schemas';
import { HttpService } from './http.service';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface StockScreenerResponse {
  data: {
    data: Array<{
      s: string; // symbol
      n: string; // name
    }>;
    resultsCount?: number;
  };
}

const STOCK_CONFIG = {
  stockBatchSize: 100,
  maxParallelRequests: 3,
  batchDelay: 1000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    @InjectModel(Exchange.name)
    private readonly exchangeModel: Model<Exchange>,
    @InjectModel(Stock.name)
    private readonly stockModel: Model<Stock>,
    @InjectModel(Financial.name)
    private readonly financialModel: Model<Financial>,
    @InjectModel(EpsGrowth.name)
    private readonly epsGrowthModel: Model<EpsGrowth>,
    private readonly httpService: HttpService,
  ) {}

  // Exchange Operations
  async createExchange(exchangeData: Partial<Exchange>) {
    const existingExchange = await this.exchangeModel
      .findOne({ market_code: exchangeData.market_code })
      .exec();

    if (existingExchange) {
      throw new Error(
        `Exchange with market code ${exchangeData.market_code} already exists`,
      );
    }

    const exchange = new this.exchangeModel(exchangeData);
    return exchange.save();
  }

  async findAllExchanges(skip = 0, limit = 10) {
    const [data, total] = await Promise.all([
      this.exchangeModel.find().skip(skip).limit(limit).lean().exec(),
      this.exchangeModel.countDocuments().exec(),
    ]);

    return { 
      data, 
      total, 
      page: Math.floor(skip / limit) + 1, 
      limit 
    };
  }

  async findExchange(marketCode: string) {
    const exchange = await this.exchangeModel
      .findOne({ market_code: marketCode })
      .exec();
    if (!exchange) {
      throw new NotFoundException(
        `Exchange with market code ${marketCode} not found`,
      );
    }
    return exchange;
  }

  async updateExchange(marketCode: string, updateData: Partial<Exchange>) {
    const exchange = await this.exchangeModel
      .findOneAndUpdate({ market_code: marketCode }, updateData, { new: true })
      .exec();

    if (!exchange) {
      throw new NotFoundException(
        `Exchange with market code ${marketCode} not found`,
      );
    }
    return exchange;
  }

  async removeExchange(marketCode: string) {
    const exchange = await this.exchangeModel
      .findOneAndDelete({ market_code: marketCode })
      .exec();

    if (!exchange) {
      throw new NotFoundException(
        `Exchange with market code ${marketCode} not found`,
      );
    }
    return exchange;
  }

  // Stock Operations
  async getAllStocks(skip = 0, limit = 20) {
    const [data, total] = await Promise.all([
      this.stockModel
        .find()
        .populate('exchange')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStocksByExchange(exchangeId: string, skip = 0, limit = 20) {
    const [data, total] = await Promise.all([
      this.stockModel
        .find({ exchange: exchangeId })
        .populate('exchange')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockModel.countDocuments({ exchange: exchangeId }).exec(),
    ]);

    if (!data.length) {
      throw new NotFoundException(`No stocks found for exchange ${exchangeId}`);
    }

    return {
      data,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStockBySymbol(symbol: string) {
    const stock = await this.stockModel
      .findOne({ symbol })
      .populate('exchange')
      .exec();

    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    return stock;
  }

  // Financial Operations
  async getEPSGrowthFromDatabase(limit = 20, skip = 0) {
    try {
      const latestEntry = await this.epsGrowthModel
        .findOne()
        .sort({ report_date: -1, year: -1, quarter: -1 })
        .lean();

      if (!latestEntry) {
        return {
          data: [],
          metadata: {
            skip,
            total: 0,
            page: 1,
            limit,
            totalPages: 0,
          },
        };
      }

      const [data, total] = await Promise.all([
        this.epsGrowthModel
          .find({
            report_date: latestEntry.report_date,
            year: latestEntry.year,
            quarter: latestEntry.quarter,
          })
          .sort({ eps_growth: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.epsGrowthModel.countDocuments({
          report_date: latestEntry.report_date,
          year: latestEntry.year,
          quarter: latestEntry.quarter,
        }),
      ]);

      return {
        data,
        metadata: {
          skip,
          total,
          page: Math.floor(skip / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting EPS growth from database: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Data Scraping Operations
  async scrapeAndSaveExchanges() {
    try {
      const response = await axios.get(
        'https://stockanalysis.com/list/exchanges/',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          },
        },
      );

      const $ = cheerio.load(response.data);
      const exchanges = [];

      $('#main > div > div > table tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        const nameCell = $(cells[0]);

        exchanges.push({
          exchange_name: nameCell.text().trim(),
          country: $(cells[1]).text().trim(),
          market_code: $(cells[2]).text().trim(),
          currency: $(cells[3]).text().trim(),
          exchange_url: nameCell.find('a').attr('href')?.trim() || '',
          timezone: 'UTC',
        });
      });

      if (exchanges.length === 0) {
        throw new Error('No exchanges found');
      }

      let newCount = 0;
      let updateCount = 0;

      for (const exchangeData of exchanges) {
        try {
          const existingExchange = await this.exchangeModel
            .findOne({ market_code: exchangeData.market_code })
            .exec();

          if (existingExchange) {
            await this.updateExchange(exchangeData.market_code, exchangeData);
            updateCount++;
          } else {
            await this.createExchange(exchangeData);
            newCount++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to save exchange ${exchangeData.market_code}:`,
            error,
          );
        }
      }

      return {
        newCount,
        updateCount,
        total: await this.exchangeModel.countDocuments().exec(),
      };

    } catch (error) {
      this.logger.error('Failed to scrape exchanges:', error);
      throw error;
    }
  }

  async scrapeStockData(exchangeIds?: string[]) {
    this.logger.log('Starting stock data scraping process');

    let existingExchanges;
    try {
      if (exchangeIds?.length) {
        existingExchanges = await this.exchangeModel
          .find({
            _id: { $in: exchangeIds },
          })
          .exec();
        if (!existingExchanges.length) {
          throw new NotFoundException('No exchanges found with provided IDs');
        }
      } else {
        existingExchanges = await this.exchangeModel.find().exec();
        if (!existingExchanges.length) {
          throw new NotFoundException(
            'No exchanges found in database. Please ensure exchanges are populated before scraping stocks.',
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to fetch exchanges: ${error.message}`);
      throw error;
    }

    const summary = {
      totalExchanges: existingExchanges.length,
      processedExchanges: 0,
      totalStocks: 0,
      newStocks: 0,
      failedExchanges: 0,
      errors: [] as string[],
    };

    try {
      for (
        let i = 0;
        i < existingExchanges.length;
        i += STOCK_CONFIG.maxParallelRequests
      ) {
        const batch = existingExchanges.slice(
          i,
          i + STOCK_CONFIG.maxParallelRequests,
        );

        const batchResults = await Promise.allSettled(
          batch.map(async (exchange) => {
            if (!exchange._id) {
              throw new Error(`Exchange ${exchange.market_code} has no ID`);
            }

            const stockData = await this.httpService.fetchStockScreener<StockScreenerResponse>(
              exchange.market_code,
            );

            if (!stockData?.data?.data) {
              throw new Error(
                `Invalid data structure received for exchange ${exchange.market_code}`,
              );
            }

            const stocksToProcess = stockData.data.data;
            const exchangeStats = {
              processedStocks: 0,
              newStocks: 0,
            };

            for (
              let j = 0;
              j < stocksToProcess.length;
              j += STOCK_CONFIG.stockBatchSize
            ) {
              const stockBatch = stocksToProcess.slice(
                j,
                j + STOCK_CONFIG.stockBatchSize,
              );
              const symbols = stockBatch.map((s) => s.s);

              const existingStocks = await this.stockModel
                .find({ symbol: { $in: symbols } })
                .select('symbol')
                .exec();

              const existingSymbols = new Set(
                existingStocks.map((s) => s.symbol),
              );
              const newStocks = stockBatch
                .filter((s) => !existingSymbols.has(s.s))
                .map((s) => ({
                  symbol: s.s,
                  company_name: s.n,
                  exchange: exchange._id,
                }));

              if (newStocks.length > 0) {
                const createdStocks = await this.stockModel.create(newStocks);
                await this.exchangeModel.findByIdAndUpdate(
                  exchange._id,
                  {
                    $push: {
                      stocks: {
                        $each: createdStocks.map((stock) => stock._id),
                      },
                    },
                  },
                  { new: true },
                );
                exchangeStats.newStocks += newStocks.length;
              }
              exchangeStats.processedStocks += stockBatch.length;
            }

            return {
              exchange: exchange.market_code,
              ...exchangeStats,
            };
          }),
        );

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            summary.processedExchanges++;
            summary.totalStocks += result.value.processedStocks;
            summary.newStocks += result.value.newStocks;
          } else {
            summary.failedExchanges++;
            summary.errors.push(result.reason.message);
          }
        });

        if (i + STOCK_CONFIG.maxParallelRequests < existingExchanges.length) {
          await sleep(STOCK_CONFIG.batchDelay);
        }
      }

      return summary;
    } catch (error) {
      this.logger.error('Fatal error during stock scraping', error);
      throw error;
    }
  }
}
