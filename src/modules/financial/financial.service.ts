import { Injectable } from '@nestjs/common';
import { PaginatedResponse, EPSGrowthResult } from '../../types';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialFetchService } from './services/financial-fetch.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';
import { logger } from '../../utils/logger';

const config = {
  maxConcurrentRequests: 5,
  batchDelay: 0,
  pageSize: 100,
};

@Injectable()
export class FinancialService {
  constructor(
    private readonly fetchState: FetchStateService,
    private readonly financialData: FinancialDataService,
    private readonly financialFetch: FinancialFetchService,
    private readonly workerPool: WorkerPoolService,
  ) {}

  async getEPSGrowthRanking(
    limit: number,
    skip: number,
  ): Promise<PaginatedResponse<EPSGrowthResult>> {
    // Get all symbols
    const allSymbols = await this.financialData.getAllSymbols();

    // Get EPS growth data for all symbols
    const epsData = await this.financialData.getEPSGrowthData(allSymbols);

    // Filter out stocks with no financial data (optional, based on requirements)
    const validData = epsData.filter((item) => item.has_financial_data);

    if (validData.length === 0) {
      return {
        data: [],
        metadata: {
          total: 0,
          limit,
          skip,
          message:
            'No financial data available. Try running /financial/scrape first to fetch data.',
        },
      };
    }

    // Sort by EPS growth in descending order
    const sorted = validData.sort((a, b) => b.eps_growth - a.eps_growth);

    // Add ranking
    const ranked = sorted.map((item, index) => ({
      symbol: item.symbol,
      eps_growth: item.eps_growth,
      rank: index + 1,
      last_report_date: item.last_report_date,
    }));

    // Apply pagination
    const paginated = ranked.slice(skip, skip + limit);

    // Return properly formatted PaginatedResponse
    const response: PaginatedResponse<EPSGrowthResult> = {
      data: paginated,
      metadata: {
        total: ranked.length,
        limit,
        skip,
      },
    };

    return response;
  }

  async fetchAndSaveFinancials() {
    try {
      let state = await this.fetchState.loadState();
      let { currentPage, totalProcessed, lastProcessedStock } = state;
      let consecutiveErrors = 0;
      const MAX_CONSECUTIVE_ERRORS = 3;

      while (true) {
        try {
          const stocks = await this.financialData.getStocksBatch(
            currentPage,
            config.pageSize,
          );
          if (!stocks.length) {
            if (currentPage === 1)
              throw new Error('No stocks found in database');
            break;
          }

          logger.info(
            `Processing page ${currentPage} with ${stocks.length} stocks (Total processed so far: ${totalProcessed})`,
          );

          const processingStart = Date.now();
          const pageProcessed = await this.workerPool.processStocksBatch(
            stocks,
            lastProcessedStock,
            {
              maxConcurrentRequests: config.maxConcurrentRequests,
              batchDelay: config.batchDelay,
            },
          );

          const processingTime = Date.now() - processingStart;
          totalProcessed += pageProcessed;
          consecutiveErrors = 0; // Reset error counter on success

          logger.info(
            `Page ${currentPage} completed in ${processingTime}ms. Successfully processed ${pageProcessed}/${stocks.length} stocks.`,
          );

          // Update state with progress
          state = {
            currentPage: currentPage + 1,
            totalProcessed,
            lastProcessedStock: null,
            lastUpdated: new Date().toISOString(),
          };
          await this.fetchState.saveState(state);
          currentPage++;

          // Adaptive delay based on processing time and success rate
          const successRate = pageProcessed / stocks.length;
          const adaptiveDelay = this.calculateAdaptiveDelay(
            successRate,
            processingTime,
          );

          if (adaptiveDelay > 0) {
            logger.info(
              `Waiting ${adaptiveDelay}ms before next page (Success rate: ${(successRate * 100).toFixed(1)}%)...`,
            );
            await WorkerPoolService.sleep(adaptiveDelay);
          }
        } catch (error) {
          consecutiveErrors++;
          logger.error(`Error processing page ${currentPage}`, error);

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error(
              `Stopping due to ${MAX_CONSECUTIVE_ERRORS} consecutive page processing failures`,
            );
          }

          // Exponential backoff for page retries
          const retryDelay = Math.min(
            1000 * Math.pow(2, consecutiveErrors),
            30000,
          );
          logger.warn(
            `Retrying page ${currentPage} after ${retryDelay}ms delay...`,
          );
          await WorkerPoolService.sleep(retryDelay);
        }
      }

      logger.info(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );

      await this.fetchState.clearState();
    } catch (error) {
      logger.error('Fatal error during financial data processing', error);
      throw error; // Re-throw to allow proper error handling by caller
    }
  }

  private calculateAdaptiveDelay(
    successRate: number,
    processingTime: number,
  ): number {
    // Base delay from config
    let delay = config.batchDelay;

    // Adjust delay based on success rate
    if (successRate < 0.5) {
      // Increase delay significantly if success rate is low
      delay *= 3;
    } else if (successRate < 0.8) {
      // Moderate increase for moderate success rate
      delay *= 2;
    } else if (successRate > 0.95) {
      // Reduce delay if success rate is very high
      delay = Math.max(delay * 0.8, 0);
    }

    // Consider processing time
    const minProcessingBuffer = 500; // Minimum 500ms between batches
    return Math.max(delay, processingTime * 0.2 + minProcessingBuffer);
  }
}

// TODO: Implement retry mechanism for failed stock processing
// TODO: Add support for type validation for dynamic financial data fields
// TODO: Consider caching processed financial data to improve performance
// TODO: Add support for different data sources (e.g., Yahoo Finance, Bloomberg)
// TODO: Implement rate limiting based on API provider's restrictions
// TODO: Add support for historical data fetching
// TODO: Implement data validation and sanitization
// TODO: Add support for different financial instruments (bonds, ETFs, etc.)
// TODO: Implement progress tracking and reporting
// TODO: Add support for parallel processing across multiple servers
// TODO: Implement data caching to reduce API calls
// TODO: Add support for custom user configurations
