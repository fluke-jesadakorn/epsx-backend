import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Stock } from '../../../database/entities/stock.entity';
import { Financial } from '../../../database/entities/financial.entity';
import { StockWithMarketCode, EPSGrowthData } from '../../../types';

@Injectable()
export class FinancialDataService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: MongoRepository<Stock>,
    @InjectRepository(Financial)
    private financialRepository: MongoRepository<Financial>,
  ) {}

  async getStocksBatch(
    page: number,
    pageSize: number,
  ): Promise<StockWithMarketCode[]> {
    const stocks = await this.stockRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return stocks.map((stock) => {
      const primaryExchange = stock.exchanges.find(exchange => exchange.primary) || stock.exchanges[0];
      return {
        _id: stock._id.toString(),
        symbol: stock.symbol,
        company_name: stock.company_name || null,
        exchanges: stock.exchanges,
        market_code: primaryExchange?.market_code || 'stocks',
      };
    });
  }

  async getAllSymbols(): Promise<string[]> {
    const stocks = await this.stockRepository.find({
      select: ['symbol'],
    });
    return stocks.map((stock) => stock.symbol);
  }

  async getEPSGrowthData(symbols: string[]): Promise<EPSGrowthData[]> {
    const results: EPSGrowthData[] = [];

    for (const symbol of symbols) {
      const financial = await this.financialRepository.findOne({
        where: { stock_id: symbol }, // Changed from symbol to stock_id to match entity structure
        order: { report_date: 'DESC' },
      });

      // Include all stocks, with null/0 growth for those without data
      results.push({
        symbol,
        eps_growth: financial?.eps_growth || 0,
        // Add additional context about the data
        has_financial_data: !!financial,
        last_report_date: financial?.report_date || null
      });
    }

    return results;
  }

  // TODO: Implement data validation and quality checks
  // TODO: Add support for filtering out stale/outdated financial data
  // TODO: Consider implementing batch queries for better performance
  // TODO: Add support for different financial periods (quarterly/yearly)
}

// TODO: Add caching layer for frequently accessed data
// TODO: Implement data aggregation for historical analysis
// TODO: Add support for custom financial metrics
// TODO: Implement data export functionality
// TODO: Add support for real-time data updates
