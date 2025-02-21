import { Controller, Get, Post, Param, Query, Inject, applyDecorators } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { PaginationParamsDto } from '../swagger/entities/common.swagger';
import {
  StockResponse,
  PaginatedStockResponse,
  ScrapingSummaryResponse,
  StockScreenerFilters,
  ScrapingSuccessResponse,
  StockScreenerResponseDto,
} from '../swagger/entities/stock.swagger';

enum StockCommand {
  GET_ALL = 'getAllStocks',
  GET_BY_EXCHANGE = 'getStocksByExchange',
  GET_BY_SYMBOL = 'getStockBySymbol',
  SAVE_DATA = 'saveStockData',
  SCRAPE_ALL = 'scrapeAllStocks',
  SCRAPE_BY_MARKET_CAP = 'scrapeStocksByMarketCap',
  SCRAPE_BY_SECTOR = 'scrapeStocksBySector',
  SCRAPE_BY_REGION = 'scrapeStocksByRegion',
  SCRAPE_BY_VOLUME = 'scrapeStocksByVolume'
}

// Reusable API decorators
const ApiPaginatedResponse = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: 200,
      description: 'List of stocks retrieved successfully',
      type: PaginatedStockResponse,
    })
  );
};

const ApiScrapeResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Scraping operation completed successfully',
      type: ScrapingSuccessResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Scraping operation failed',
    })
  );
};

@Controller('stocks')
@ApiTags('Stock')
export class StockController {
  constructor(
    @Inject('STOCK_SERVICE') private readonly stockService: ClientProxy,
  ) {}

  private async sendCommand<T = any>(
    command: StockCommand,
    payload?: any,
  ): Promise<T> {
    return firstValueFrom(this.stockService.send({ cmd: command }, payload));
  }

  private async handleScrapeOperation(command: StockCommand, payload?: any) {
    return this.sendCommand<ScrapingSuccessResponse>(command, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stocks with pagination' })
  @ApiPaginatedResponse()
  async getAllStocks(@Query() params: PaginationParamsDto) {
    return this.sendCommand(StockCommand.GET_ALL, params);
  }

  @Get('exchange/:exchangeId')
  @ApiOperation({ summary: 'Get stocks by exchange with pagination' })
  @ApiParam({
    name: 'exchangeId',
    type: String,
    description: 'Exchange identifier (e.g., NYSE, NASDAQ)',
  })
  @ApiPaginatedResponse()
  @ApiResponse({
    status: 404,
    description: 'Exchange not found',
  })
  async getStocksByExchange(
    @Param('exchangeId') exchangeId: string,
    @Query() params: PaginationParamsDto,
  ) {
    return this.sendCommand(StockCommand.GET_BY_EXCHANGE, { exchangeId, params });
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Get stock by symbol' })
  @ApiParam({
    name: 'symbol',
    type: String,
    description: 'Stock symbol identifier (e.g., AAPL, GOOGL)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock found',
    type: StockResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock not found',
  })
  async getStockBySymbol(@Param('symbol') symbol: string) {
    return this.sendCommand(StockCommand.GET_BY_SYMBOL, symbol);
  }

  @Post('scrape/:exchangeId')
  @ApiOperation({
    summary: 'Scrape and save stock data for an exchange',
    description: 'Fetches and stores current stock data for all listings on the specified exchange',
  })
  @ApiParam({
    name: 'exchangeId',
    type: String,
    description: 'Exchange identifier (e.g., NYSE, NASDAQ)',
  })
  @ApiScrapeResponse()
  @ApiResponse({
    status: 400,
    description: 'Invalid exchange ID or stock data format',
  })
  async scrapeStockData(
    @Param('exchangeId') exchangeId: string,
    @Query() filters: StockScreenerFilters,
  ) {
    return this.handleScrapeOperation(StockCommand.SAVE_DATA, { exchangeId, filters });
  }

  @Post('scrape/all')
  @ApiOperation({
    summary: 'Scrape all stocks from all exchanges',
    description: 'Comprehensive scraping of stock data from all available exchanges',
  })
  @ApiScrapeResponse()
  async scrapeAllStocks() {
    return this.handleScrapeOperation(StockCommand.SCRAPE_ALL);
  }

  @Post('scrape/market-cap')
  @ApiOperation({
    summary: 'Scrape stocks by market cap range',
    description: 'Scrape stocks that fall within the specified market cap range',
  })
  @ApiQuery({
    name: 'minMarketCap',
    required: false,
    type: Number,
    description: 'Minimum market cap in millions USD',
    example: 1000,
  })
  @ApiQuery({
    name: 'maxMarketCap',
    required: false,
    type: Number,
    description: 'Maximum market cap in millions USD',
    example: 5000,
  })
  @ApiScrapeResponse()
  @ApiResponse({
    status: 400,
    description: 'Invalid market cap range',
  })
  async scrapeStocksByMarketCap(
    @Query('minMarketCap') minMarketCap?: number,
    @Query('maxMarketCap') maxMarketCap?: number,
  ) {
    return this.handleScrapeOperation(StockCommand.SCRAPE_BY_MARKET_CAP, {
      minMarketCap,
      maxMarketCap,
    });
  }

  @Post('scrape/sector/:sector')
  @ApiOperation({
    summary: 'Scrape stocks by sector',
    description: 'Scrape stocks from a specific industry sector',
  })
  @ApiParam({
    name: 'sector',
    type: String,
    description: 'Industry sector to filter by',
    example: 'Technology',
  })
  @ApiScrapeResponse()
  async scrapeStocksBySector(@Param('sector') sector: string) {
    return this.handleScrapeOperation(StockCommand.SCRAPE_BY_SECTOR, sector);
  }

  @Post('scrape/region/:region')
  @ApiOperation({
    summary: 'Scrape stocks by region',
    description: 'Scrape stocks from a specific geographic region',
  })
  @ApiParam({
    name: 'region',
    type: String,
    description: 'Geographic region to filter by',
    example: 'APAC',
  })
  @ApiScrapeResponse()
  async scrapeStocksByRegion(@Param('region') region: string) {
    return this.handleScrapeOperation(StockCommand.SCRAPE_BY_REGION, region);
  }

  @Post('scrape/volume')
  @ApiOperation({
    summary: 'Scrape stocks by trading volume',
    description: 'Scrape stocks that meet or exceed the specified minimum trading volume',
  })
  @ApiQuery({
    name: 'minVolume',
    required: true,
    type: Number,
    description: 'Minimum trading volume threshold',
    example: 100000,
  })
  @ApiScrapeResponse()
  @ApiResponse({
    status: 400,
    description: 'Invalid volume parameter',
  })
  async scrapeStocksByVolume(@Query('minVolume') minVolume: number) {
    return this.handleScrapeOperation(StockCommand.SCRAPE_BY_VOLUME, { minVolume });
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
