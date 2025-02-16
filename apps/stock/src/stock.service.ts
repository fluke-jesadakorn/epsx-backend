import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Stock, StockDocument } from './schemas/stock.schema';
import { HttpService } from './http.service';
import { 
  StockScreenerResponse, 
  PaginationParams,
  Paginate,
  formatPaginationResponse
} from './interfaces/common.interfaces';
import { Exchange as ExchangeDocument } from './interfaces/exchange.interface';

const STOCK_CONFIG = {
  stockBatchSize: 100,
  maxParallelRequests: 3,
  batchDelay: 1000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectModel(Stock.name)
    private stockModel: Model<StockDocument>,
    @InjectModel('Exchange')
    private exchangeModel: Model<ExchangeDocument>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get all stocks with pagination
   */
  @Paginate()
  async getAllStocks(params: PaginationParams = {}) {
    const skip = params.skip || 0;
    const limit = params.limit || 20;
    const [data, total] = await Promise.all([
      this.stockModel.find().populate('exchange').skip(skip).limit(limit).exec(),
      this.stockModel.countDocuments().exec(),
    ]);
    return formatPaginationResponse(data, total, skip, limit);
  }

  /**
   * Get stocks by exchange with pagination
   */
  @Paginate()
  async getStocksByExchange(exchangeId: string, params: PaginationParams = {}) {
    if (!exchangeId) {
      throw new BadRequestException('Exchange ID is required');
    }

    const skip = params.skip || 0;
    const limit = params.limit || 20;
    const [data, total] = await Promise.all([
      this.stockModel
        .find({ exchange: exchangeId })
        .populate('exchange')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockModel.countDocuments({ exchange: exchangeId }).exec(),
    ]);

    if (!data.length) {
      throw new NotFoundException(`No stocks found for exchange ${exchangeId}`);
    }

    return formatPaginationResponse(data, total, skip, limit);
  }

  /**
   * Get stock by symbol
   */
  async getStockBySymbol(symbol: string) {
    const stock = await this.stockModel.findOne({ symbol }).populate('exchange').exec();
    
    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }
    
    return stock;
  }

  /**
   * Save stock data for an exchange
   * 
   * Future feature possibilities:
   * - Add support for real-time stock price updates via WebSocket
   * - Implement historical data storage and tracking
   * - Add data validation and sanitization for more robust error handling
   * - Include additional stock metrics (market cap, volume, P/E ratio, etc.)
   * - Add retry mechanism for failed exchange requests
   * - Implement selective exchange update (update specific exchanges only)
   * - Add data normalization for cross-exchange compatibility
   * - Consider implementing a caching layer for frequently accessed data
   */
  async saveStockData(exchangeId: string, stockData: StockScreenerResponse) {
    this.logger.log(`Starting stock data processing for exchange ${exchangeId}`);
    
    const exchange = await this.exchangeModel.findById(exchangeId).exec();
    if (!exchange) {
      throw new NotFoundException(`Exchange with ID ${exchangeId} not found`);
    }

    try {
      // Validate data structure and extract stocks array
      if (!stockData.data?.data) {
        this.logger.error(
          `Invalid data structure received for exchange ${exchange.market_code}`
        );
        throw new NotFoundException(
          `Invalid data structure received for exchange ${exchange.market_code}`
        );
      }

      const stocksToProcess = stockData.data.data;
      const totalStocks = stockData.data.resultsCount || stocksToProcess.length;
      this.logger.log(`Retrieved ${totalStocks} stocks for ${exchange.market_code}`);

      // Create array of symbols for bulk existence check
      const symbols = stocksToProcess.map((s) => s.s);

      // Bulk check for existing stocks
      const existingStocks = await this.stockModel
        .find({ symbol: { $in: symbols } })
        .select('symbol')
        .exec();

      const existingSymbols = new Set(
        existingStocks.map((s: StockDocument) => s.symbol)
      );

      // Filter only new stocks that need to be inserted
      const newStocks = stocksToProcess
        .filter((s) => !existingSymbols.has(s.s))
        .map((s) => ({
          symbol: s.s,
          company_name: s.n,
          exchange: exchange._id
        }));

      // Bulk insert new stocks
      if (newStocks.length > 0) {
        try {
          const createdStocks = (await Promise.all(
            newStocks.map(stock => this.stockModel.create(stock))
          )) as StockDocument[];
          
          if (createdStocks.length > 0) {
            // Update exchange document with the new stock references
            await this.exchangeModel.findByIdAndUpdate(
              exchange._id,
              {
                $push: {
                  stocks: {
                    $each: createdStocks.map(stock => stock._id)
                  }
                }
              },
              { new: true }
            );
          }

          this.logger.log(`Inserted ${newStocks.length} new stocks and updated exchange references`);
        } catch (error) {
          this.logger.error(`Failed to insert stocks batch: ${error.message}`);
          throw error;
        }
      }

      this.logger.log(
        `Exchange ${exchange.market_code} processing completed. Processed ${totalStocks} stocks.`
      );

      return { 
        success: true, 
        message: 'Stock data processing completed',
        processed: totalStocks,
        new: newStocks.length 
      };
    } catch (error) {
      this.logger.error('Error during stock data processing:', error);
      throw error;
    }
  }

  // TODO: Add methods for:
  // - Real-time price updates
  // - Historical data retrieval
  // - Technical analysis
  // - Market indicators
  // - Stock performance metrics
}
