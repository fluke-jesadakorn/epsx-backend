import { Injectable } from '@nestjs/common';
import {
  EPSGrowthResult,
  FetchState,
  WorkerConfig,
} from '@financial/types/financial.types';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';
import { logger } from '@financial/utils/logger';
import { Retry, RetryConfig } from '@financial/utils/retry.util';
import { Paginate } from '@financial/utils/decorators/paginate.decorator';
import { formatPaginationResponse } from './utils/pagination.util';
import { PaginationParams, PaginationResult } from './types';

// Worker pool and processing configuration
const WORKER_CONFIG: WorkerConfig & { pageSize: number } = {
  maxConcurrentRequests: 5,
  batchDelay: 0,
  pageSize: 100,
};

// Configuration for database operations retry
const DB_RETRY_CONFIG: Partial<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 500,
  maxDelay: 5000,
  retryableErrors: [
    'MongoError',
    'MongoNetworkError',
    'MongoServerError',
    'WriteConflict',
    /Operation .* failed/,
    'No stocks found in database',
  ],
};

interface ProcessPageResult {
  shouldBreak: boolean;
  totalProcessed: number;
  nextPage: number;
  successRate: number;
  processingTime: number;
}

interface ProcessPageBreakResult {
  shouldBreak: true;
  totalProcessed: number;
  nextPage?: never; // Explicitly state nextPage doesn't exist
}

type PageResult = ProcessPageResult | ProcessPageBreakResult;

@Injectable()
export class FinancialService {
  constructor(
    private readonly fetchState: FetchStateService,
    private readonly financialData: FinancialDataService,
    private readonly workerPool: WorkerPoolService,
  ) {}

  /**
   * Retrieves EPS growth ranking data with pagination
   * The @Paginate() decorator will transform this into PaginatedResponse<EPSGrowthResult>
   */
  /**
   * Retrieves EPS growth ranking data with pagination
   * @returns PaginationResult that will be transformed into PaginatedResponse by @Paginate decorator
   */
  @Retry(DB_RETRY_CONFIG)
  @Paginate()
  async getEPSGrowthRanking(
    params: PaginationParams = {},
  ): Promise<PaginationResult<EPSGrowthResult>> {
    // Extract and validate pagination params
    const limit = params.limit || 20;
    const skip = params.skip || 0;

    const {
      data: epsData,
      metadata: { total },
    } = await this.financialData.getEPSGrowthData(limit, skip);
    const ranked = this.mapEPSGrowthData(epsData);

    // Format response with enhanced pagination metadata
    return formatPaginationResponse(ranked, total, skip, limit);
  }

  /**
   * Maps raw EPS data to ranked result format
   */
  private mapEPSGrowthData(epsData: any[]): EPSGrowthResult[] {
    return epsData.map((item) => ({
      symbol: item.symbol,
      company_name: item.company_name,
      market_code: item.market_code,
      exchange_name: item.exchange_name,
      eps: item.eps,
      eps_growth: item.eps_growth,
      rank: item.rank,
      last_report_date: item.last_report_date,
    }));
  }

  /**
   * Main function to fetch and save financial data for all stocks
   * Uses retry mechanism and adaptive delays to handle errors
   */
  async fetchAndSaveFinancials(): Promise<number> {
    try {
      let state = await this.fetchState.loadState();
      let { currentPage, totalProcessed } = state;

      while (true) {
        const result = await this.processStocksPage(
          currentPage,
          totalProcessed,
        );

        if (result.shouldBreak) {
          break;
        }

        totalProcessed = result.totalProcessed;
        currentPage = result.nextPage;

        // Update state after successful processing
        await this.updateFetchState({
          currentPage: currentPage,
          totalProcessed: totalProcessed,
          lastProcessedStock: null,
          lastUpdated: new Date().toISOString(),
        } as FetchState);

        // Apply adaptive delay before next page
        if ('processingTime' in result && 'successRate' in result) {
          const delay = this.calculateAdaptiveDelay(
            result.successRate,
            result.processingTime,
          );
          if (delay > 0) {
            logger.info(
              `Waiting ${delay}ms before next page (Success rate: ${(result.successRate * 100).toFixed(1)}%)...`,
            );
            await WorkerPoolService.sleep(delay);
          }
        }
      }

      logger.info(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );

      await this.fetchState.clearState();
      return totalProcessed;
    } catch (error) {
      logger.error('Fatal error during financial data processing', error);
      throw error;
    }
  }

  /**
   * Process a single page of stocks with retry capability
   */
  @Retry({ ...DB_RETRY_CONFIG, maxAttempts: 5, initialDelay: 1000 })
  private async processStocksPage(
    currentPage: number,
    totalProcessed: number,
  ): Promise<PageResult> {
    const stocks = await this.financialData.getStocksBatch(
      currentPage,
      WORKER_CONFIG.pageSize,
    );

    if (!stocks.length) {
      if (currentPage === 1) {
        throw new Error('No stocks found in database');
      }
      return { shouldBreak: true, totalProcessed };
    }

    logger.info(
      `Processing page ${currentPage} with ${stocks.length} stocks (Total processed so far: ${totalProcessed})`,
    );

    const processingStart = Date.now();
    const pageProcessed = await this.workerPool.processStocksBatch(
      stocks,
      null,
      {
        maxConcurrentRequests: WORKER_CONFIG.maxConcurrentRequests,
        batchDelay: WORKER_CONFIG.batchDelay,
      },
    );

    const processingTime = Date.now() - processingStart;
    const successRate = pageProcessed / stocks.length;

    logger.info(
      `Page ${currentPage} completed in ${processingTime}ms. Successfully processed ${pageProcessed}/${stocks.length} stocks.`,
    );

    return {
      shouldBreak: false,
      totalProcessed: totalProcessed + pageProcessed,
      nextPage: currentPage + 1,
      successRate,
      processingTime,
    };
  }

  /**
   * Updates the fetch state with progress information
   */
  @Retry(DB_RETRY_CONFIG)
  private async updateFetchState(state: FetchState): Promise<void> {
    await this.fetchState.saveState(state);
  }

  /**
   * Calculates adaptive delay between batch processing operations
   * based on success rate and processing time
   */
  private calculateAdaptiveDelay(
    successRate: number,
    processingTime: number,
  ): number {
    let delay = WORKER_CONFIG.batchDelay;

    // Dynamic delay adjustments based on success rate
    if (successRate < 0.5) {
      delay *= 3; // Significant increase for low success
    } else if (successRate < 0.8) {
      delay *= 2; // Moderate increase
    } else if (successRate > 0.95) {
      delay = Math.max(delay * 0.8, 0); // Reduce delay for high success
    }

    // Ensure minimum processing buffer
    const minProcessingBuffer = 500;
    return Math.max(delay, processingTime * 0.2 + minProcessingBuffer);
  }
}
