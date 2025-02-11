import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Financial } from '../../../database/schemas/financial.schema';
import { Stock } from '../../../database/schemas/stock.schema';
import { logger } from '../../../utils/logger';
import { HttpService } from '../../../common/http/http.service';
import {
  StockWithMarketCode,
  ProcessedFinancialData,
  StockFinancialResponse,
} from '../../../types/financial.types';
import { processDynamicFinancialData } from '../../../utils/financial-data.util';
import { Retry, RetryConfig } from '../../../utils/retry.util';

// Configuration for API retry attempts
const API_RETRY_CONFIG: Partial<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 15000,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'Rate limit exceeded',
    'Too Many Requests',
    /5\d\d/,
    'Failed to fetch',
    'Network Error',
  ],
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
  ],
};

@Injectable()
export class FinancialFetchService {
  constructor(
    @InjectModel(Financial.name)
    private financialModel: Model<Financial>,
    @InjectModel(Stock.name)
    private stockModel: Model<Stock>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Checks if a stock with the given symbol already exists in the database
   * @param symbol Stock symbol to check
   * @returns Promise<boolean> True if stock exists, false otherwise
   */
  @Retry(DB_RETRY_CONFIG)
  async checkStockExists(symbol: string): Promise<boolean> {
    const existingStock = await this.stockModel.findOne({ symbol }).exec();
    return !!existingStock;
  }

  /**
   * Fetches financial data for a given stock symbol and processes it into a standardized format
   * @param symbol Stock symbol to fetch financial data for
   * @returns Processed financial data array
   * @throws Error if the request fails or data is invalid
   */
  @Retry(API_RETRY_CONFIG)
  async fetchStockFinancials(
    symbol: string,
  ): Promise<ProcessedFinancialData[]> {
    logger.info(`Fetching financial data for ${symbol}`);
    const response = await this.httpService.fetchStockAnalysis<any>(
      `/quote/${symbol}/financials/__data.json?p=quarterly&x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=001`,
    );

    if (!response) {
      logger.warn(`No response data returned for ${symbol}`);
      return [];
    }

    // Log the shape of the data to help diagnose issues
    logger.debug(
      `Response structure for ${symbol}: ` +
        `hasNodes=${!!response.nodes}, ` +
        `dataType=${typeof response}, ` +
        `keys=[${Object.keys(response).join(', ')}]`,
    );

    if (typeof response !== 'object') {
      throw new Error(`Invalid response format for ${symbol}: not an object`);
    }

    return processDynamicFinancialData(response);
  }

  /**
   * Validates and normalizes fiscal quarter data
   */
  private validateFiscalQuarter(
    fiscalQuarter: string | number,
    symbol: string,
  ): number | null {
    let quarterNumber: number;

    if (typeof fiscalQuarter === 'string') {
      quarterNumber = parseInt(fiscalQuarter.replace('Q', ''));
    } else if (typeof fiscalQuarter === 'number') {
      quarterNumber = fiscalQuarter;
    } else {
      logger.warn(
        `Invalid fiscal quarter type for ${symbol}: ${typeof fiscalQuarter}`,
      );
      return null;
    }

    if (quarterNumber < 1 || quarterNumber > 4) {
      logger.warn(
        `Invalid fiscal quarter value for ${symbol}: ${quarterNumber}`,
      );
      return null;
    }

    return quarterNumber;
  }

  /**
   * Logs financial operation status with consistent format
   */
  private logFinancialOperation(
    operation: 'processing' | 'updated' | 'inserted' | 'completed',
    symbol: string,
    quarter: number,
    year: number,
  ): void {
    const periodStr = `${symbol} - Q${quarter} ${year}`;
    switch (operation) {
      case 'processing':
        logger.info(`Processing financial data for ${periodStr}`);
        break;
      case 'updated':
        logger.info(`Updated existing financial data for ${periodStr}`);
        break;
      case 'inserted':
        logger.info(`Inserted new financial data for ${periodStr}`);
        break;
      case 'completed':
        logger.info(`Successfully saved financial data for ${periodStr}`);
        break;
    }
  }

  /**
   * Saves or updates financial data for a given stock
   * @param financialData Financial data to save
   * @param stock Stock information
   */
  @Retry(DB_RETRY_CONFIG)
  async saveFinancialData(
    financialData: StockFinancialResponse,
    stock: StockWithMarketCode,
  ): Promise<void> {
    if (!financialData.fiscal_quarter) {
      logger.warn(`Missing fiscal quarter for ${stock.symbol}`);
      return;
    }
    
    const quarterNumber = this.validateFiscalQuarter(
      financialData.fiscal_quarter,
      stock.symbol,
    );
    if (quarterNumber === null) return;

    const financialRecord = {
      report_date: new Date(financialData.report_date),
      fiscal_quarter: quarterNumber,
      fiscal_year: financialData.fiscal_year,
      revenue: financialData.revenue,
      revenue_growth: financialData.revenue_growth,
      operating_income: financialData.operating_income,
      interest_expense: financialData.interest_expense,
      net_income: financialData.net_income,
      eps_basic: financialData.eps_basic,
      eps_diluted: financialData.eps_diluted,
      free_cash_flow: financialData.free_cash_flow,
      profit_margin: financialData.profit_margin,
      total_operating_expenses: financialData.total_operating_expenses,
    };

    if (!financialRecord.fiscal_quarter || !financialRecord.fiscal_year) {
      logger.warn(`Missing fiscal period data for ${stock.symbol}`);
      return;
    }

    this.logFinancialOperation(
      'processing',
      stock.symbol,
      financialRecord.fiscal_quarter,
      financialRecord.fiscal_year,
    );

    // Check if financial data already exists
    const existingFinancial = await this.financialModel.findOne({
      stock: stock._id,
      fiscal_quarter: financialRecord.fiscal_quarter,
      fiscal_year: financialRecord.fiscal_year,
    }).exec();

    if (existingFinancial) {
      await this.financialModel.updateOne(
        {
          stock: stock._id,
          fiscal_quarter: financialRecord.fiscal_quarter,
          fiscal_year: financialRecord.fiscal_year,
        },
        { $set: financialRecord }
      ).exec();
      this.logFinancialOperation(
        'updated',
        stock.symbol,
        financialRecord.fiscal_quarter,
        financialRecord.fiscal_year,
      );
    } else {
      await this.financialModel.create({
        ...financialRecord,
        stock: stock._id,
      });
      this.logFinancialOperation(
        'inserted',
        stock.symbol,
        financialRecord.fiscal_quarter,
        financialRecord.fiscal_year,
      );
    }

    this.logFinancialOperation(
      'completed',
      stock.symbol,
      financialRecord.fiscal_quarter,
      financialRecord.fiscal_year,
    );
  }
}

// TODO: Implement retry mechanism for failed API requests
// TODO: Add rate limiting for API calls
// TODO: Implement request caching
// TODO: Add support for multiple data sources
// TODO: Implement data validation before saving
// TODO: Add support for batch processing
// TODO: Add validation for fiscal period ranges (e.g. Q1-Q4)
// TODO: Implement duplicate detection across different report dates for same fiscal period
// TODO: Add data consistency checks between fiscal periods
// TODO: Consider implementing data versioning for financial updates
// TODO: Add support for handling fiscal year transitions
// TODO: Implement data quality scoring for financial records
