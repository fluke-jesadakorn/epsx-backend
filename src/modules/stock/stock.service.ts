import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessagePattern } from '@nestjs/microservices';
import { HttpService } from '../../common/http/http.service';
import { StockScreenerResponse } from '../../types/stock-analysis.types';
import { logger } from '../../utils/logger';
import { PaginationParams } from '../../types';
import { getPaginationOptions } from '../../utils/pagination.util';
import { Paginate } from '../../utils/decorators/paginate.decorator';
import { Stock } from '../../database/schemas/stock.schema';
import { Exchange } from '../../database/schemas/exchange.schema';
import { config } from '../../config';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectModel(Stock.name)
    private stockModel: Model<Stock>,
    @InjectModel(Exchange.name)
    private exchangeModel: Model<Exchange>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get all stocks with pagination
   */
  @MessagePattern({ cmd: 'get_all_stocks' })
  @Paginate()
  async getAllStocks(params: PaginationParams = {}) {
    const { skip, take } = getPaginationOptions(params);
    const [data, total] = await Promise.all([
      this.stockModel.find().populate('exchange').skip(skip).limit(take).exec(),
      this.stockModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  /**
   * Get stocks by exchange with pagination
   */
  @MessagePattern({ cmd: 'get_stocks_by_exchange' })
  @Paginate()
  async getStocksByExchange(exchangeId: string, params: PaginationParams = {}) {
    if (!exchangeId) {
      throw new BadRequestException('Exchange ID is required');
    }

    const { skip, take } = getPaginationOptions(params);
    const [data, total] = await Promise.all([
      this.stockModel
        .find({ exchange: exchangeId })
        .populate('exchange')
        .skip(skip)
        .limit(take)
        .exec(),
      this.stockModel.countDocuments({ exchange: exchangeId }).exec(),
    ]);
    return { data, total };
  }

  @MessagePattern('scrape_stocks')
  async saveStockData() {
    this.logger.log('Starting stock data scraping process');
    const existingExchanges = await this.exchangeModel.find().exec();

    try {
      for (
        let i = 0;
        i < existingExchanges.length;
        i += config.app.stock.maxParallelRequests
      ) {
        const batch = existingExchanges.slice(
          i,
          i + config.app.stock.maxParallelRequests,
        );
        this.logger.log(
          `Processing batch ${Math.floor(i / config.app.stock.maxParallelRequests) + 1} of ${Math.ceil(existingExchanges.length / config.app.stock.maxParallelRequests)}`,
        );

        // Process each exchange in the batch concurrently
        const batchPromises = batch.map(async (e) => {
          if (!e._id) {
            this.logger.error(`Exchange ${e.market_code} has no ID`);
            return;
          }

          const stockData =
            await this.httpService.fetchStockScreener<StockScreenerResponse>(
              e.market_code,
            );

          if (!stockData) {
            this.logger.error(`Failed to fetch data for exchange ${e.market_code}`);
            throw new NotFoundException('Failed to fetch stock data');
          }

          // Validate data structure and extract stocks array
          if (!stockData.data?.data) {
            this.logger.error(
              `Invalid data structure received for exchange ${e.market_code}`,
            );
            throw new NotFoundException(
              'Invalid data structure received for exchange ${e.market_code}',
            );
          }

          const stocksToProcess = stockData.data.data;

          const totalStocks =
            stockData.data.resultsCount || stocksToProcess.length;
          this.logger.log(`Retrieved ${totalStocks} stocks for ${e.market_code}`);

          let processedCount = 0;

          // Process stocks in batches
          for (
            let j = 0;
            j < stocksToProcess.length;
            j += config.app.stock.stockBatchSize
          ) {
            const stockBatch = stocksToProcess.slice(
              j,
              j + config.app.stock.stockBatchSize,
            );

            // Create array of symbols for bulk existence check
            const symbols = stockBatch.map((s) => s.s);

            // Bulk check for existing stocks
            const existingStocks = await this.stockModel
              .find({ symbol: { $in: symbols } })
              .select('symbol')
              .exec();

            const existingSymbols = new Set(
              existingStocks.map((s) => s.symbol),
            );

            // Filter only new stocks that need to be inserted
            const newStocks = stockBatch
              .filter((s) => !existingSymbols.has(s.s))
              .map((s) => ({
                symbol: s.s,
                company_name: s.n,
                exchange: e, // Add exchange relationship
              }));

            // Bulk insert new stocks
            if (newStocks.length > 0) {
              try {
                // Update exchange document to include new stock references
                const createdStocks = await this.stockModel.create(newStocks);
                
                // Update exchange document with the new stock references
                await this.exchangeModel.findByIdAndUpdate(
                  e._id,
                  {
                    $push: {
                      stocks: {
                        $each: createdStocks.map(stock => stock._id)
                      }
                    }
                  },
                  { new: true }
                );

                this.logger.log(`Inserted ${newStocks.length} new stocks and updated exchange references`);
              } catch (error) {
                this.logger.error(`Failed to insert stocks batch: ${error.message}`);
              }
            }

            processedCount += stockBatch.length;
            this.logger.log(
              `Processed ${stockBatch.length} stocks in batch (${newStocks.length} new)`,
            );
          }

          this.logger.log(
            `Exchange ${e.exchange_name} processing completed. Processed ${processedCount} stocks.`,
          );
        });

        await Promise.all(batchPromises);

        if (
          i + config.app.stock.maxParallelRequests <
          existingExchanges.length
        ) {
          this.logger.log(
            `Waiting ${config.app.stock.batchDelay}ms before processing next batch...`,
          );
          await sleep(config.app.stock.batchDelay);
        }
      }

      this.logger.log('All batches have been processed successfully.');
      return { success: true, message: 'Stock data processing completed' };
    } catch (error) {
      this.logger.error('Fatal error during stock data processing:', error);
      throw error;
    }
  }
}
