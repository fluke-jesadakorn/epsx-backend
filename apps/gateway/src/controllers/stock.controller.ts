import { Controller, Get, Post, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { PaginationParamsDto, StockScreenerResponseDto } from '@investing/common';
import { StockResponse, PaginatedStockResponse } from '../swagger/entities/stock.swagger';

type StockCommand = 
  | 'getAllStocks' 
  | 'getStocksByExchange' 
  | 'getStockBySymbol' 
  | 'saveStockData';

@ApiTags('Stocks')
@Controller('stocks')
export class StockController {
  constructor(
    @Inject('STOCK_SERVICE') private readonly stockService: ClientProxy,
  ) {}

  private async sendCommand<T = any>(command: StockCommand, payload?: any): Promise<T> {
    return firstValueFrom(
      this.stockService.send({ cmd: command }, payload)
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all stocks with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of stocks retrieved successfully',
    type: PaginatedStockResponse
  })
  async getAllStocks(@Query() params: PaginationParamsDto) {
    return this.sendCommand('getAllStocks', params);
  }

  @Get('exchange/:exchangeId')
  @ApiOperation({ summary: 'Get stocks by exchange with pagination' })
  @ApiParam({
    name: 'exchangeId',
    type: String,
    description: 'Exchange identifier (e.g., NYSE, NASDAQ)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of stocks for the specified exchange',
    type: PaginatedStockResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Exchange not found'
  })
  async getStocksByExchange(
    @Param('exchangeId') exchangeId: string,
    @Query() params: PaginationParamsDto,
  ) {
    return this.sendCommand('getStocksByExchange', { exchangeId, params });
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Get stock by symbol' })
  @ApiParam({
    name: 'symbol',
    type: String,
    description: 'Stock symbol identifier (e.g., AAPL, GOOGL)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock found',
    type: StockResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Stock not found'
  })
  async getStockBySymbol(@Param('symbol') symbol: string) {
    return this.sendCommand('getStockBySymbol', symbol);
  }

  @Post('scrape/:exchangeId')
  @ApiOperation({ 
    summary: 'Scrape and save stock data for an exchange',
    description: 'Fetches and stores current stock data for all listings on the specified exchange'
  })
  @ApiParam({
    name: 'exchangeId',
    type: String,
    description: 'Exchange identifier (e.g., NYSE, NASDAQ)'
  })
  @ApiBody({ type: StockScreenerResponseDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock data scraped and saved successfully',
    type: StockScreenerResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid exchange ID or stock data format'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Scraping or saving operation failed'
  })
  async scrapeStockData(
    @Param('exchangeId') exchangeId: string,
    @Query() stockData: StockScreenerResponseDto,
  ) {
    return this.sendCommand('saveStockData', { exchangeId, stockData });
  }

  /**
   * TODO: Future Features
   * 
   * - Real-time price updates via WebSocket
   *   Will implement push notifications for price changes
   * 
   * - Historical data retrieval
   *   Add endpoints for fetching OHLCV data with custom date ranges
   * 
   * - Technical analysis endpoints
   *   Implement common indicators (MA, RSI, MACD)
   * 
   * - Market indicators
   *   Add market breadth, volatility indices
   * 
   * - Stock performance metrics
   *   Include YTD returns, beta, correlation with indices
   */
}
