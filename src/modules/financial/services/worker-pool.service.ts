import { Injectable } from '@nestjs/common';
import { logger } from '../../../utils/logger';
import { StockFinancialResponse } from '../../../types/stock-analysis.types';
import { StockWithMarketCode, WorkerConfig } from '../../../types';
import { FinancialFetchService } from './financial-fetch.service';
import { FetchStateService } from './fetch-state.service';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2
};

@Injectable()
export class WorkerPoolService {
  constructor(
    private readonly financialFetch: FinancialFetchService,
    private readonly fetchState: FetchStateService
  ) {}

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    stock: StockWithMarketCode,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error = new Error('No attempts made');
    let delay = retryConfig.initialDelay;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(
            `Retry attempt ${attempt} for ${stock.symbol} after ${delay}ms delay`
          );
          await WorkerPoolService.sleep(delay);
        }
        return await operation();
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          `Attempt ${attempt + 1}/${retryConfig.maxRetries + 1} failed for ${
            stock.symbol
          }: ${error.message}`
        );
        
        // Determine if we should retry based on error type
        if (this.shouldRetry(error)) {
          // Calculate next delay with exponential backoff
          delay = Math.min(
            delay * retryConfig.backoffFactor,
            retryConfig.maxDelay
          );
        } else {
          // If error is not retryable, throw immediately
          throw error;
        }
      }
    }

    throw new Error(
      `Failed to process ${stock.symbol} after ${
        retryConfig.maxRetries + 1
      } attempts. Last error: ${lastError.message}`
    );
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or rate limiting
    if (error.response) {
      const status = error.response.status;
      // Retry on rate limiting (429) or server errors (500-599)
      return status === 429 || (status >= 500 && status < 600);
    }
    // Retry on network errors (no response)
    return !error.response && error.request;
  }

  async processStocksBatch(
    stocks: StockWithMarketCode[],
    lastProcessedStock: string | null,
    config: WorkerConfig
  ): Promise<number> {
    let index = lastProcessedStock 
      ? stocks.findIndex(stock => stock.symbol === lastProcessedStock) + 1
      : 0;
    
    let processedCount = 0;
    const errors: Array<{ symbol: string; error: string }> = [];

    const processStock = async (stock: StockWithMarketCode) => {
      try {
        await this.retryWithBackoff(async () => {
          const processedData = await this.financialFetch.fetchStockFinancials(stock.symbol);
          if (processedData && processedData.length > 0) {
            const financialData: StockFinancialResponse = {
              nodes: [{ data: processedData }],
              report_date: new Date().toISOString(),
              fiscal_quarter: processedData[0].fiscalQuarter,
              fiscal_year: processedData[0].fiscalYear,
              revenue: processedData[0].revenue,
              revenue_growth: processedData[0].revenueGrowth,
              operating_income: processedData[0].operatingIncome,
              interest_expense: processedData[0].interestExpense,
              net_income: processedData[0].netIncome,
              eps_basic: processedData[0].epsBasic,
              eps_diluted: processedData[0].epsDiluted,
              free_cash_flow: processedData[0].freeCashFlow,
              profit_margin: processedData[0].profitMargin,
              total_operating_expenses: processedData[0].totalOperatingExpenses,
            };
            await this.financialFetch.saveFinancialData(financialData, stock);
            processedCount++;
            logger.info(`Successfully processed ${stock.symbol}`);
          }
        }, stock);
      } catch (error) {
        errors.push({ 
          symbol: stock.symbol, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        logger.error(`Failed to process ${stock.symbol}`, error);
      }
    };

    // Enhanced concurrent processing with semaphore-like control
    // Queue-based processing implementation with memory management
    const queue: StockWithMarketCode[] = stocks.slice(index);
    const activeWorkers = new Set<Promise<void>>();
    const CHUNK_SIZE = 50; // Process stocks in smaller chunks to manage memory

    const worker = async () => {
      while (queue.length > 0) {
        // Process in chunks to prevent memory buildup
        const chunk = queue.splice(0, CHUNK_SIZE);
        
        for (const stock of chunk) {
          // Wait if we've reached max concurrent requests
          while (activeWorkers.size >= config.maxConcurrentRequests) {
            await Promise.race(Array.from(activeWorkers));
          }
          
          // Clean up completed workers
          for (const worker of activeWorkers) {
            // Remove completed promises
            Promise.race([worker, Promise.resolve()]).then(() => {
              activeWorkers.delete(worker);
            });
          }

          // Create worker promise with cleanup
          const workerPromise = processStock(stock).finally(() => {
            activeWorkers.delete(workerPromise);
          });
          
          // Add to active workers set
          activeWorkers.add(workerPromise);
        }

        // Allow GC to clean up processed chunk
        global.gc?.();
      }
      
      // Wait for remaining workers in chunk to complete
      if (activeWorkers.size > 0) {
        await Promise.all(Array.from(activeWorkers));
        activeWorkers.clear();
      }
    };

    // Start workers
    await Promise.all(
      Array(config.maxConcurrentRequests)
        .fill(null)
        .map(() => worker())
    );
    
    // Log summary of processing
    if (errors.length > 0) {
      logger.warn(
        `Processing completed with ${errors.length} errors:\n${JSON.stringify(errors, null, 2)}`
      );
    }
    
    return processedCount;
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// TODO: Implement metrics collection for retry attempts and success rates
// TODO: Add circuit breaker pattern for API calls
// TODO: Implement adaptive concurrency based on error rates
// TODO: Add support for different retry strategies based on error types
// TODO: Consider implementing queue-based processing for better flow control
// TODO: Add support for partial batch recovery on process restart
// TODO: Implement real-time progress monitoring
// TODO: Add support for priority-based processing
// TODO: Consider implementing dead letter queue for failed items
// TODO: Add support for custom retry policies per stock/exchange
