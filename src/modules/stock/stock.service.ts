import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HttpService } from '../../common/http/http.service';
import { StockScreenerResponse } from '../../types/stock-analysis.types';
import { logger } from '../../utils/logger';
import { Stock } from '../../database/entities/stock.entity';
import { Exchange } from '../../database/entities/exchange.entity';
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
// 11. Review and improve error handling for edge cases in stock data processing
// 12. Consider implementing batch retry mechanism for failed updates
// 13. Add support for handling multiple primary exchanges per stock

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private readonly httpService: HttpService,
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
          if (!e._id) {
            logger.error(`Exchange ${e.market_code} has no ID`);
            return;
          }

          const stockData =
            await this.httpService.fetchStockScreener<StockScreenerResponse>(
              e.market_code,
            );

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
                },
              });

              const existingStockMap = new Map(
                existingStocks.map((stock) => [stock.symbol, stock]),
              );

              // Helper function to compare stock data
              const hasDataChanged = (
                existing: Stock,
                newData: Partial<Stock>,
              ): boolean => {
                return (
                  existing.company_name !== newData.company_name ||
                  existing.primary_exchange_market_code !== newData.primary_exchange_market_code ||
                  JSON.stringify(existing.exchanges) !== JSON.stringify(newData.exchanges)
                );
              };

              const toUpdate: Stock[] = [];
              const toInsert: Partial<Stock>[] = [];

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
                  primary_exchange_market_code: e.market_code,
                  exchanges: [{ market_code: e.market_code, primary: true }],
                };

                const existing = existingStockMap.get(stockData.s);
                if (existing) {
                  // Only update if data has actually changed
                  if (hasDataChanged(existing, stockEntity)) {
                    Object.assign(existing, stockEntity);
                    toUpdate.push(existing);
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
                await this.stockRepository.save(toInsert);
              }

              if (toUpdate.length > 0) {
                await this.stockRepository.save(toUpdate);
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
            `Exchange ${e.name} processing completed. Processed ${processedCount} stocks.`,
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
