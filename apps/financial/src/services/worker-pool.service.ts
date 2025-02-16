import { Injectable } from '@nestjs/common';
import { LoggerUtil } from '../utils/logger.util';

interface WorkerConfig {
  maxConcurrentRequests: number;
  batchDelay: number;
}

@Injectable()
export class WorkerPoolService {
  private isProcessing: boolean = false;

  constructor(private readonly logger: LoggerUtil) {}

  /**
   * Process a batch of stocks with controlled concurrency
   */
  async processStocksBatch(
    stocks: any[],
    processingCallback: ((stock: any) => Promise<boolean>) | null,
    config: WorkerConfig,
  ): Promise<number> {
    if (this.isProcessing) {
      throw new Error('Worker pool is already processing a batch');
    }

    this.isProcessing = true;
    let successCount = 0;

    try {
      // Create processing queue
      const queue = [...stocks];
      let activeWorkers: Promise<void>[] = [];

      while (queue.length > 0 || activeWorkers.length > 0) {
        // Fill up worker slots
        while (
          queue.length > 0 &&
          activeWorkers.length < config.maxConcurrentRequests
        ) {
          const stock = queue.shift();
          if (stock) {
            const worker = this.processStock(stock, processingCallback)
              .then((success) => {
                if (success) successCount++;
              })
              .catch((error) => {
                this.logger.error(
                  `Error processing stock: ${error.message}`,
                  error.stack,
                );
              });
            activeWorkers.push(worker);
          }
        }

        // Wait for at least one worker to complete and filter completed workers
        if (activeWorkers.length > 0) {
          await Promise.race(activeWorkers);
          const newActiveWorkers = [];
          for (const worker of activeWorkers) {
            const status = await Promise.race([
              worker.then(() => 'completed'),
              Promise.resolve('pending'),
            ]);
            if (status === 'pending') {
              newActiveWorkers.push(worker);
            }
          }
          activeWorkers = newActiveWorkers;
        }

        // Apply batch delay if configured
        if (config.batchDelay > 0) {
          await WorkerPoolService.sleep(config.batchDelay);
        }
      }

      return successCount;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single stock
   */
  private async processStock(
    stock: any,
    callback: ((stock: any) => Promise<boolean>) | null,
  ): Promise<boolean> {
    try {
      if (callback) {
        return await callback(stock);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process stock: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Utility method for controlled delays
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
