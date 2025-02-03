import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { Stock } from '../../entities/stock.entity';
import { Exchange } from '../../entities/exchange.entity';
import { config } from '../../config';

/**
 * Configuration used by the StockService:
 * - maxParallelRequests: Number of exchanges to process concurrently
 * - stockBatchSize: Number of stocks to process in one batch
 * - batchDelay: Delay between processing batches in milliseconds
 *
 * These values can be configured via environment variables:
 * - STOCK_MAX_PARALLEL_REQUESTS
 * - STOCK_BATCH_SIZE
 * - STOCK_BATCH_DELAY
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: Future Features
// 1. Add a mechanism to sync exchange data changes with associated stocks
// 2. Consider implementing a background job to periodically update stock exchange info
// 3. Add validation to ensure exchange data is complete before stock creation
// 4. Consider caching exchange data to reduce database queries
// 5. Add support for different API endpoints per exchange to handle special cases
// 6. Enhance error handling with detailed error types and recovery strategies
// 7. Implement comprehensive rate limiting per exchange to prevent API blocks
// 8. Implement data versioning to track historical changes in stock information
// 9. Add data validation rules specific to each exchange's format
// 10. Consider implementing soft delete for stock entries

async function fetchStockData(
  { market }: { market: string },
  retries = 3,
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Special case for NASDAQ which uses a different endpoint structure
      const endpoint = market === 'NASDAQ' ? 's' : 'a';
      const filterParam = market === 'NASDAQ' ? 'exchange' : 'exchangeCode';

      const response = await axios.get(
        `https://api.stockanalysis.com/api/screener/${endpoint}/f?m=marketCap&s=desc&c=s,n&f=${filterParam}-is-${market}`,
        { timeout: 10000 }, // 10 second timeout
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (isLastAttempt) {
        logger.error(
          `Failed to fetch ${market} data after ${retries} attempts`,
          error,
        );
        return null;
      } else {
        logger.warn(
          `Attempt ${attempt}/${retries} failed for ${market}: ${errorMessage}, retrying...`,
        );
        await sleep(1000 * attempt); // Exponential backoff
      }
    }
  }
  return null;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
  ) {}

  async saveStockData() {
    const existingExchanges = await this.exchangeRepository.find();

    try {
      // Process exchanges in batches
      for (
        let i = 0;
        i < existingExchanges.length;
        i += config.app.stock.maxParallelRequests
      ) {
        const batch = existingExchanges.slice(
          i,
          i + config.app.stock.maxParallelRequests,
        );
        logger.info(
          `Processing batch ${Math.floor(i / config.app.stock.maxParallelRequests) + 1} of ${Math.ceil(existingExchanges.length / config.app.stock.maxParallelRequests)}`,
        );

        // Process each exchange in the batch concurrently
        const batchPromises = batch.map(async (e) => {
          if (!e.id) {
            logger.error(`Exchange ${e.market_code} has no ID`);
            return;
          }

          const stockData = await fetchStockData({
            market: e.market_code,
          });

          // Validate stock data
          if (!stockData) {
            logger.error(`Failed to fetch data for exchange ${e.market_code}`);
            return;
          }

          // Validate data structure and extract stocks array
          if (!stockData.data?.data) {
            logger.error(
              `Invalid data structure received for exchange ${e.market_code}`,
            );
            return;
          }

          const stocksToProcess = stockData.data.data;

          const totalStocks =
            stockData.data.resultsCount || stocksToProcess.length;
          logger.info(`Retrieved ${totalStocks} stocks for ${e.market_code}`);

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

            try {
              // Get all existing stocks for this batch in one query
              const symbols = stockBatch.map((s) => s.s);
              const existingStocks = await this.stockRepository.find({
                where: {
                  symbol: In(symbols),
                  exchange_id: e.id,
                },
              });

              const existingStockMap = new Map(
                existingStocks.map((stock) => [stock.symbol, stock]),
              );

              // Prepare bulk operations
              const toUpdate: { id: string; data: Partial<Stock> }[] = [];
              const toInsert: Partial<Stock>[] = [];

              // Helper function to compare stock data
              const hasDataChanged = (
                existing: Stock,
                newData: Partial<Stock>,
              ): boolean => {
                return (
                  existing.company_name !== newData.company_name ||
                  existing.market_code !== newData.market_code ||
                  existing.exchange_name !== newData.exchange_name ||
                  existing.country !== newData.country ||
                  existing.currency !== newData.currency ||
                  existing.stocks !== newData.stocks ||
                  existing.exchange_url !== newData.exchange_url
                );
              };

              stockBatch.forEach((stockData: any) => {
                if (!stockData.s || !stockData.n) {
                  logger.warn(
                    `Invalid stock data received: ${JSON.stringify(stockData)}`,
                  );
                  return;
                }

                // Create stock entity with all required fields
                const stockEntity: Partial<Stock> = {
                  symbol: stockData.s,
                  company_name: stockData.n,
                  exchange_id: e.id,
                  market_code: e.market_code,
                  exchange_name: e.exchange_name,
                  country: e.country,
                  currency: e.currency,
                  stocks: e.stocks,
                  exchange_url: e.exchange_url,
                };

                const existing = existingStockMap.get(stockData.s);
                if (existing?.id) {
                  // Only update if data has actually changed
                  if (hasDataChanged(existing, stockEntity)) {
                    toUpdate.push({ id: existing.id, data: stockEntity });
                    logger.debug(
                      `Stock ${stockData.s} data has changed, updating...`,
                    );
                  }
                } else {
                  toInsert.push(stockEntity);
                  logger.debug(
                    `New stock ${stockData.s} found, will be inserted`,
                  );
                }
              });

              // Perform bulk operations
              if (toInsert.length > 0) {
                await this.stockRepository
                  .createQueryBuilder()
                  .insert()
                  .values(toInsert)
                  .execute();
              }

              if (toUpdate.length > 0) {
                await Promise.all(
                  toUpdate.map(({ id, data }) =>
                    this.stockRepository.update(id, data),
                  ),
                );
              }

              processedCount += stockBatch.length;
              logger.info(`Processed ${stockBatch.length} stocks in batch`);
            } catch (error: any) {
              // Handle any errors
              const formattedError =
                error instanceof Error
                  ? error
                  : new Error(JSON.stringify(error));
              logger.error(
                `Failed to process stock batch`,
                formattedError.message,
              );
              throw formattedError;
            }
          }

          logger.info(
            `Exchange ${e.exchange_name} processing completed. Processed ${processedCount} stocks.`,
          );
        });

        // Wait for all exchanges in the current batch to complete
        await Promise.all(batchPromises);

        // Add delay between batches to prevent rate limiting
        if (
          i + config.app.stock.maxParallelRequests <
          existingExchanges.length
        ) {
          logger.info(
            `Waiting ${config.app.stock.batchDelay}ms before processing next batch...`,
          );
          await sleep(config.app.stock.batchDelay);
        }
      }

      // Log completion of all batches
      logger.info('All batches have been processed successfully.');
    } catch (error) {
      logger.error('Fatal error during stock data processing');
    }
  }
}
