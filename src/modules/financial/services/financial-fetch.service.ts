import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Financial } from '../../../database/entities/financial.entity';
import { StockFinancialResponse } from '../../../types/stock-analysis.types';
import { logger } from '../../../utils/logger';
import { HttpService } from '../../../common/http/http.service';
import { StockWithMarketCode, ProcessedFinancialData } from '../../../types';

@Injectable()
export class FinancialFetchService {
  /**
   * Processes dynamic financial data from a nested structure into a flat array of financial records.
   * @param financialData Raw financial data with nested nodes structure
   * @returns Array of processed financial records with mapped keys and values
   *
   * Expected structure:
   * financialData: {
   *   nodes: [
   *     ...,
   *     { data: [
   *       { financialData: number },
   *       ...,
   *       { key1: value1, key2: value2, ... }
   *     ]}
   *   ]
   * }
   *
   * TODO: Add support for custom field mappings
   * TODO: Implement data validation schema
   * TODO: Add data transformation hooks
   */
  private processDynamicFinancialData(
    financialData: any,
  ): ProcessedFinancialData[] {
    if (!financialData.nodes || financialData.nodes.length < 3) {
      logger.warn('Invalid dynamic financial data structure: missing nodes.');
      return [];
    }

    const d = financialData.nodes[2].data;
    if (!d || !Array.isArray(d)) {
      logger.warn(
        'Invalid dynamic financial data structure: missing data array.',
      );
      return [];
    }

    const financialIndex = d[0]?.financialData;
    if (typeof financialIndex !== 'number') {
      logger.warn(
        'Invalid dynamic financial data structure: missing financialData index.',
      );
      return [];
    }

    const f = d[financialIndex];
    if (!f || typeof f !== 'object') {
      logger.warn(
        'Invalid dynamic financial data structure: missing mapping object.',
      );
      return [];
    }

    const keys = Object.keys(f);
    if (keys.length === 0) {
      logger.warn(
        'Invalid dynamic financial data structure: mapping object has no keys.',
      );
      return [];
    }

    const dataMap = keys.reduce(
      (acc, key) => {
        const arr = d[f[key]];
        if (!Array.isArray(arr)) {
          logger.warn(
            `Expected array at d[f[${key}]] but got undefined or non-array.`,
          );
          acc[key] = [];
        } else {
          acc[key] = arr.map((idx: number) => d[idx]);
        }
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const numEntries = dataMap[keys[0]]?.length || 0;
    if (numEntries === 0) {
      logger.warn('No entries found in dynamic financial data.');
      return [];
    }

    return Array.from({ length: numEntries }, (_, i) => {
      const entry: ProcessedFinancialData = {};
      keys.forEach((key) => {
        entry[key] = key === 'fiscalYear' ? +dataMap[key][i] : dataMap[key][i];
      });
      return entry;
    });
  }

  constructor(
    @InjectRepository(Financial)
    private financialRepository: MongoRepository<Financial>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Fetches financial data for a given stock symbol and processes it into a standardized format
   * @param symbol Stock symbol to fetch financial data for
   * @returns Processed financial data array
   * @throws Error if the request fails or data is invalid
   */
  async fetchStockFinancials(
    symbol: string,
  ): Promise<ProcessedFinancialData[]> {
    try {
      const data = await this.httpService.fetchStockAnalysis<any>(
        `/quote/${symbol}/financials/__data.json?p=quarterly&x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=001`,
      );
      if (!data) {
        logger.warn(`No financial data returned for ${symbol}`);
        return [];
      }
      return this.processDynamicFinancialData(data);
    } catch (error) {
      logger.error(`Failed to fetch financial data for ${symbol}`, error);
      throw error;
    }
  }

  async saveFinancialData(
    financialData: StockFinancialResponse,
    stock: StockWithMarketCode,
  ): Promise<void> {
    try {
      const financialRecord = {
        report_date: new Date(financialData.report_date),
        fiscal_quarter: financialData.fiscal_quarter,
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

      await this.financialRepository.findOneAndUpdate(
        {
          stock_id: stock._id,
          report_date: financialRecord.report_date,
        },
        { $set: financialRecord },
        { upsert: true },
      );

      logger.info(`Successfully saved financial data for ${stock.symbol}`);
    } catch (error) {
      logger.error(`Failed to save financial data for ${stock.symbol}`, error);
      throw error;
    }
  }
}

// TODO: Implement retry mechanism for failed API requests
// TODO: Add rate limiting for API calls
// TODO: Implement request caching
// TODO: Add support for multiple data sources
// TODO: Implement data validation before saving
// TODO: Add support for batch processing
