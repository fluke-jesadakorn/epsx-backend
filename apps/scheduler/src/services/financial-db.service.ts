import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Financial, Stock } from '@app/common/schemas';
import { StockWithMarketCode } from '../types/scheduler.types';

@Injectable()
export class FinancialDbService {
  private readonly logger = new Logger(FinancialDbService.name);
  private readonly pageSize = process.env.PAGE_SIZE
    ? parseInt(process.env.PAGE_SIZE)
    : 100;

  constructor(
    @InjectModel(Financial.name)
    private financialModel: Model<Financial>,
    @InjectModel(Stock.name)
    private stockModel: Model<Stock>,
  ) {}

  async getPaginatedStocks(page: number): Promise<StockWithMarketCode[]> {
    try {
      const skip = (page - 1) * this.pageSize;

      const stocks = await this.stockModel
        .find()
        .populate('exchange', 'market_code')
        .select('symbol company_name exchange')
        .skip(skip)
        .limit(this.pageSize)
        .lean()
        .exec();

      return stocks.map((stock) => ({
        _id: stock._id.toString(), // Convert ObjectId to string
        symbol: stock.symbol,
        company_name: stock.company_name,
        market_code: (stock.exchange as any).market_code,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching paginated stocks: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async saveFinancialData(
    processedData: any,
    stock: StockWithMarketCode,
  ): Promise<void> {
    try {
      const stockDoc = await this.stockModel.findOne({ symbol: stock.symbol });
      if (!stockDoc) {
        throw new Error(`Stock not found: ${stock.symbol}`);
      }

      await this.financialModel.findOneAndUpdate(
        { stock: stockDoc._id },
        {
          $set: {
            ...processedData,
            updated_at: new Date(),
          },
        },
        { upsert: true, new: true },
      );
      this.logger.log(`Successfully saved financial data for ${stock.symbol}`);
    } catch (error) {
      this.logger.error(
        `Error saving financial data for ${stock.symbol}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markUrlAsProcessed(stock: StockWithMarketCode): Promise<void> {
    try {
      const stockDoc = await this.stockModel.findOne({ symbol: stock.symbol });
      if (!stockDoc) {
        throw new Error(`Stock not found: ${stock.symbol}`);
      }

      await this.financialModel.findOneAndUpdate(
        { stock: stockDoc._id },
        {
          $set: {
            last_processed: new Date(),
            processing_status: 'completed',
          },
        },
      );
      this.logger.log(`Marked URL as processed for stock: ${stock.symbol}`);
    } catch (error) {
      this.logger.error(
        `Error marking URL as processed for ${stock.symbol}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
