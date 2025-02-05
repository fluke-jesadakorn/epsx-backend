import { Controller, Get } from '@nestjs/common';
import { StockService } from './stock.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('scrape')
  @ApiOperation({
    summary: 'Scrape stock data',
    description: 'Fetches and saves stock data from external sources including company information and market data'
  })
  @ApiResponse({
    status: 200,
    description: 'Stock data scraped successfully',
    content: {
      'application/json': {
        example: {
          success: true,
          message: 'Stock data scraped and saved successfully',
          count: 500,
          data: [
            {
              symbol: 'AAPL',
              name: 'Apple Inc.',
              sector: 'Technology',
              industry: 'Consumer Electronics'
            },
            {
              symbol: 'GOOGL',
              name: 'Alphabet Inc.',
              sector: 'Technology',
              industry: 'Internet Content & Information'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'Failed to scrape stock data',
          error: 'Internal Server Error'
        }
      }
    }
  })
  async scrapeStocks() {
    return this.stockService.saveStockData();
  }
}
