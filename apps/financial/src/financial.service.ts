import { Injectable } from '@nestjs/common';
import { 
  PaginationParams, 
  PaginationResult, 
  EPSGrowthResult,
  FetchState,
  WorkerConfig
} from '@investing/common';
import { LoggerUtil } from './utils/logger.util';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';

// Local implementation of retry decorator
function Retry(config: { maxAttempts: number; initialDelay: number; maxDelay?: number; retryableErrors?: (string | RegExp)[] }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let delay = config.initialDelay;
      let attempt = 1;

      while (attempt <= config.maxAttempts) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error: any) {
          const shouldRetry = config.retryableErrors?.some(pattern => {
            if (pattern instanceof RegExp) {
              return pattern.test(error.message);
            }
            return error.name === pattern || error.message.includes(pattern);
          });

          if (attempt === config.maxAttempts || !shouldRetry) {
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, config.maxDelay || 30000);
          attempt++;
        }
      }
    };

    return descriptor;
  };
}

// Worker pool and processing configuration
const WORKER_CONFIG: WorkerConfig & { pageSize: number } = {
  maxConcurrentRequests: 5,
  batchDelay: 0,
  pageSize: 100,
};

// Configuration for database operations retry
const DB_RETRY_CONFIG = {
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
  nextPage?: number;
  successRate?: number;
  processingTime?: number;
}

@Injectable()
export class FinancialService {
  constructor(
    private readonly fetchState: FetchStateService,
    private readonly financialData: FinancialDataService,
    private readonly workerPool: WorkerPoolService,
    private readonly logger: LoggerUtil,
  ) {}

  /**
   * Retrieves EPS growth ranking data with pagination
   */
  @Retry(DB_RETRY_CONFIG)
  async getEPSGrowthRanking(
    params: PaginationParams = {},
  ): Promise<PaginationResult<EPSGrowthResult>> {
    const limit = params.limit || 20;
    const skip = params.skip || 0;

    const {
      data: epsData,
      metadata: { total },
    } = await this.financialData.getEPSGrowthData(limit, skip);

    return {
      data: epsData,
      metadata: {
        total,
        skip,
        limit,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit),
        orderBy: params.orderBy,
        direction: params.direction
      },
    };
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
        const result = await this.processStocksPage(currentPage, totalProcessed);
        
        if (result.shouldBreak) {
          break;
        }

        totalProcessed = result.totalProcessed;
        currentPage = result.nextPage || currentPage + 1;
        const successRate = result.successRate || 1;
        const processingTime = result.processingTime || 0;

        // Update state after successful processing
        await this.updateFetchState({
          currentPage,
          totalProcessed,
          lastProcessedStock: null,
          lastUpdated: new Date().toISOString(),
        });

        // Apply adaptive delay before next page
        const delay = this.calculateAdaptiveDelay(
          successRate,
          processingTime,
        );
        if (delay > 0) {
          this.logger.log(
            `Waiting ${delay}ms before next page (Success rate: ${(
              successRate * 100
            ).toFixed(1)}%)...`,
          );
          await WorkerPoolService.sleep(delay);
        }
      }

      this.logger.log(
        `Financial data processing completed. Total stocks processed: ${totalProcessed}`,
      );

      await this.fetchState.clearState();
      return totalProcessed;
    } catch (error) {
      this.logger.error('Fatal error during financial data processing', error);
      throw error;
    }
  }

  /**
   * Process a single page of stocks with retry capability
   */
  @Retry({ ...DB_RETRY_CONFIG, maxAttempts: 5, initialDelay: 1000 })
  private async processStocksPage(currentPage: number, totalProcessed: number): Promise<ProcessPageResult> {
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

    this.logger.log(
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

    this.logger.log(
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
