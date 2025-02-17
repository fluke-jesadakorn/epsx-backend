import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Financial } from '../database/schemas/financial.schema';
import { Stock } from '../database/schemas/stock.schema';
import { StockWithMarketCode, EPSGrowthData } from '../types';
import { logger } from '../utils/logger';
import {
  getEPSGrowthPipeline,
  getEPSGrowthCountPipeline,
} from '../database/aggregations/financial.aggregation';

type EPSAggregationResult = EPSGrowthData;

@Injectable()
export class FinancialDataService {
  constructor(
    @InjectModel(Financial.name)
    private financialModel: Model<Financial>,
    @InjectModel(Stock.name)
    private stockModel: Model<Stock>,
  ) {}

  async getStocksBatch(
    page: number,
    pageSize: number,
  ): Promise<StockWithMarketCode[]> {
    const stocks = await this.stockModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return stocks.map((stock) => ({
      _id: stock._id.toString(),
      symbol: stock.symbol,
      company_name: stock.company_name || null,
      exchanges: [
        { market_code: stock.exchange?.market_code || 'stocks', primary: true },
      ],
      market_code: stock.exchange?.market_code || 'stocks',
    }));
  }

  async getEPSGrowthData(
    limit: number,
    skip: number,
  ): Promise<{
    data: EPSGrowthData[];
    metadata: {
      total: number;
      limit: number;
      skip: number;
      error?: string;
    };
  }> {
    // Validate pagination parameters
    const validLimit = Math.max(1, Math.min(limit || 3, 100));
    const validSkip = Math.max(0, skip || 0);

    try {
      // Verify we have data before proceeding
      const dataExists = await this.financialModel.exists({
        eps_basic: { $ne: null },
      });

      if (!dataExists) {
        logger.warn('No valid EPS data found in database');
        return {
          data: [],
          metadata: {
            total: 0,
            limit: validLimit,
            skip: validSkip,
          },
        };
      }

      // Get total count using global aggregation pipeline
      const countPipeline = getEPSGrowthCountPipeline();
      const totalResult = await this.financialModel
        .aggregate(countPipeline)
        .allowDiskUse(true)
        .exec();
      const total = totalResult[0]?.total || 0;

      // Get EPS growth data using global aggregation pipeline
      const pipeline = getEPSGrowthPipeline(validSkip, validLimit);

      // Index optimization is handled by schema definition
      const results = await this.financialModel
        .aggregate<EPSAggregationResult>(pipeline)
        .allowDiskUse(true)
        .exec();

      /**
       * TODO: Future Improvements for Stock-Financial Relationships
       * 1. Implement atomic transactions for financial data updates
       * 2. Add bidirectional reference validation
       * 3. Implement cleanup for orphaned financial records
       * 4. Add cascade updates for stock symbol changes
       * 5. Implement periodic integrity checks for relationships
       * 6. Add reference consistency validation
       * 7. Optimize query performance for financial data lookups
       * 8. Implement caching for frequently accessed financial data
       * 9. Add support for bulk financial data updates
       * 10. Implement versioning for financial data changes
       */

      return {
        data: results,
        metadata: {
          total,
          limit: validLimit,
          skip: validSkip,
        },
      };
    } catch (error) {
      logger.error('Error in getEPSGrowthData:', error);

      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        if (error.message.includes('MongoServerError')) {
          throw new Error('Database operation failed. Please try again later.');
        }
        if (error.message.includes('MongoNetworkError')) {
          throw new Error('Database connection error. Please try again later.');
        }
      }

      // For unknown errors, return empty result with error flag
      return {
        data: [],
        metadata: {
          total: 0,
          limit: validLimit,
          skip: validSkip,
          error: 'An unexpected error occurred while fetching EPS data',
        },
      };
    }
  }

  /**
   * Creates new financial data while maintaining bidirectional relationship with stock
   */
  async createFinancialData(
    financialData: Partial<Financial> & { stock: string | any },
  ) {
    try {
      // Validate that stock exists before creating financial data
      const stockExists = await this.stockModel.findById(financialData.stock);
      if (!stockExists) {
        logger.error(`Stock with ID ${financialData.stock} not found`);
        throw new Error('Stock not found');
      }

      // Create the financial record
      const createdFinancial = await this.financialModel.create(financialData);

      // Update the stock document to include the new financial reference
      await this.stockModel.findByIdAndUpdate(
        financialData.stock,
        { $push: { financials: createdFinancial._id } },
        { new: true },
      );

      logger.info(
        `Created financial data and updated stock reference for stock ${financialData.stock}`,
      );

      return createdFinancial;
    } catch (error) {
      logger.error(`Failed to create financial data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes financial data while maintaining referential integrity
   */
  async deleteFinancialData(financialId: string) {
    try {
      const financial = await this.financialModel.findById(financialId);
      if (!financial) {
        throw new Error('Financial data not found');
      }

      // Remove the reference from the stock document
      await this.stockModel.findByIdAndUpdate(financial.stock, {
        $pull: { financials: financialId },
      });

      // Delete the financial document
      await this.financialModel.findByIdAndDelete(financialId);

      logger.info(
        `Deleted financial data and removed stock reference for financial ${financialId}`,
      );
    } catch (error) {
      logger.error(`Failed to delete financial data: ${error.message}`);
      throw error;
    }
  }

  // TODO: Implement data validation and quality checks
  // TODO: Add data normalization for EPS calculations
  // TODO: Consider implementing moving average for EPS growth
  // TODO: Add support for different growth periods (YoY, QoQ)
  // TODO: Implement outlier detection for EPS values
  // TODO: Add data quality scoring system
  // TODO: Add error monitoring and alerting for failed queries
  // TODO: Implement rate limiting and request throttling
  // TODO: Consider implementing circuit breaker pattern for DB operations
  // TODO: Add support for filtering out stale/outdated financial data
  // TODO: Consider implementing batch queries for better performance
  // TODO: Add support for different financial periods (quarterly/yearly)
  // TODO: Implement automated data reconciliation
  // TODO: Add support for custom date ranges
  // TODO: Implement data transformation and cleansing
}

// Future improvements:
// TODO: Add caching layer for frequently accessed data
// TODO: Implement data aggregation for historical analysis
// TODO: Add support for custom financial metrics
// TODO: Implement data export functionality
// TODO: Add support for real-time data updates
// TODO: Consider implementing websocket updates for live data
// TODO: Add support for bulk data operations
// TODO: Implement data versioning for audit trails
// TODO: Add support for financial data backfilling
