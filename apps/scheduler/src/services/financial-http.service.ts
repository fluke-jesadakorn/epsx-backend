import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { StockWithMarketCode } from '../types/scheduler.types';

@Injectable()
export class FinancialHttpService {
  private readonly logger = new Logger(FinancialHttpService.name);
  private readonly maxRetryAttempts = process.env.MAX_RETRY_ATTEMPTS ? parseInt(process.env.MAX_RETRY_ATTEMPTS) : 3;
  private readonly initialRetryDelay = process.env.INITIAL_RETRY_DELAY ? parseInt(process.env.INITIAL_RETRY_DELAY) : 500;
  private readonly maxRetryDelay = process.env.MAX_RETRY_DELAY ? parseInt(process.env.MAX_RETRY_DELAY) : 5000;

  constructor(private readonly httpService: HttpService) {}

  async fetchFinancialData(stock: StockWithMarketCode): Promise<any> {
    let retryCount = 0;
    let delay = this.initialRetryDelay;

    while (retryCount < this.maxRetryAttempts) {
      try {
        // Implementation will need to be updated with actual API endpoint
        const response = await this.httpService.get(`/api/financial/${stock.symbol}`).toPromise();
        return response.data;
      } catch (error) {
        retryCount++;
        if (retryCount === this.maxRetryAttempts) {
          this.logger.error(
            `Failed to fetch financial data for ${stock.symbol} after ${this.maxRetryAttempts} attempts`,
            error.stack,
          );
          throw error;
        }

        this.logger.warn(
          `Retry attempt ${retryCount} for ${stock.symbol}. Waiting ${delay}ms before next attempt.`,
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, this.maxRetryDelay);
      }
    }
  }
}
