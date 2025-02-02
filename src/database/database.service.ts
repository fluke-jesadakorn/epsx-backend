import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../entities/exchange.entity';
import { Stock } from '../entities/stock.entity';
import { Financial } from '../entities/financial.entity';
import { Event } from '../entities/event.entity';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Financial)
    private readonly financialRepository: Repository<Financial>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly logger: LoggerService,
  ) {}

  async getExchanges(): Promise<Exchange[]> {
    try {
      return await this.exchangeRepository.find();
    } catch (error) {
      this.logger.error('Failed to get exchanges', error);
      throw error;
    }
  }

  async upsertExchange(
    exchange: Partial<Exchange> | Partial<Exchange>[],
  ): Promise<void> {
    try {
      const exchanges = Array.isArray(exchange) ? exchange : [exchange];
      await this.exchangeRepository.upsert(exchanges, ['market_code']);
    } catch (error) {
      this.logger.error('Failed to upsert exchange', error);
      throw error;
    }
  }

  async getStockBySymbol(symbol: string): Promise<Stock | null> {
    try {
      return await this.stockRepository.findOne({
        where: { symbol },
        relations: ['exchange'],
      });
    } catch (error) {
      this.logger.error(`Failed to get stock by symbol ${symbol}`, error);
      throw error;
    }
  }

  async getAllStocks(page = 1, limit = 100): Promise<Stock[]> {
    try {
      return await this.stockRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['exchange'],
      });
    } catch (error) {
      this.logger.error('Failed to get stocks', error);
      throw error;
    }
  }

  async upsertStock(stock: Partial<Stock> | Partial<Stock>[]): Promise<void> {
    try {
      const stocks = Array.isArray(stock) ? stock : [stock];
      await this.stockRepository.upsert(stocks, ['symbol', 'exchange']);
    } catch (error) {
      this.logger.error('Failed to upsert stock', error);
      throw error;
    }
  }

  async getFinancialsByStockAndDate(
    stockId: string,
    reportDate: Date,
  ): Promise<Financial | null> {
    try {
      return await this.financialRepository.findOne({
        where: {
          stock: { id: stockId },
          report_date: reportDate,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get financials for stock ${stockId} and date ${reportDate}`,
        error,
      );
      throw error;
    }
  }

  async upsertFinancials(
    financial: Partial<Financial> | Partial<Financial>[],
  ): Promise<void> {
    try {
      const financials = Array.isArray(financial) ? financial : [financial];
      await this.financialRepository.upsert(financials, [
        'stock_id',
        'report_date',
        'fiscal_quarter',
        'fiscal_year',
      ]);
    } catch (error) {
      this.logger.error('Failed to upsert financials', error);
      throw error;
    }
  }

  /**
   * Get all financial records for a given stock ID
   * @param stockId - The ID of the stock
   * @returns Array of financial records
   */
  async getFinancialsByStockId(stockId: string): Promise<Financial[]> {
    try {
      return await this.financialRepository.find({
        where: {
          stock_id: stockId,
        },
        order: {
          report_date: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get financials for stock ${stockId}`, error);
      throw error;
    }
  }

  async financialExists(stockId: string, reportDate: Date): Promise<boolean> {
    try {
      const financial = await this.getFinancialsByStockAndDate(
        stockId,
        reportDate,
      );
      return financial !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check financial existence for stock ${stockId} and date ${reportDate}`,
        error,
      );
      throw error;
    }
  }
}
