import { ApiProperty } from '@nestjs/swagger';

export class StockResponse {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Apple Inc.' })
  name: string;

  @ApiProperty({ description: 'Current price', example: 175.0 })
  price: number;
}

export class PaginatedStockResponse {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'List of stocks', type: [StockResponse] })
  data: StockResponse[];
}

export class StockScreenerResponseDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Apple Inc.' })
  name: string;

  @ApiProperty({ description: 'Industry sector', example: 'Technology' })
  sector: string;
}

export class ScrapingSummaryResponse {
  @ApiProperty({ 
    description: 'Total number of exchanges that were processed',
    example: 5,
    minimum: 0 
  })
  totalExchanges: number;

  @ApiProperty({ 
    description: 'Number of exchanges successfully processed without errors',
    example: 4,
    minimum: 0 
  })
  processedExchanges: number;

  @ApiProperty({ 
    description: 'Total number of stocks found across all exchanges',
    example: 1000,
    minimum: 0 
  })
  totalStocks: number;

  @ApiProperty({ 
    description: 'Number of new unique stocks added to the database',
    example: 50,
    minimum: 0 
  })
  newStocks: number;

  @ApiProperty({ 
    description: 'Number of exchanges that encountered errors during processing',
    example: 1,
    minimum: 0 
  })
  failedExchanges: number;

  @ApiProperty({ 
    description: 'Detailed error messages for failed operations',
    example: [
      'Failed to fetch data for NYSE: Rate limit exceeded',
      'Invalid data format received for NASDAQ'
    ],
    isArray: true
  })
  errors: string[];
}

export class StockScreenerFilters {
  @ApiProperty({
    description: 'Industry sectors to include',
    example: ['Technology', 'Healthcare', 'Finance'],
    isArray: true,
    required: false
  })
  sectors?: string[];

  @ApiProperty({
    description: 'Geographic regions to filter by',
    example: ['North America', 'APAC', 'Europe'],
    isArray: true,
    required: false
  })
  regions?: string[];

  @ApiProperty({
    description: 'Minimum market capitalization in millions USD',
    example: 1000,
    minimum: 0,
    required: false
  })
  minMarketCap?: number;

  @ApiProperty({
    description: 'Minimum daily trading volume',
    example: 100000,
    minimum: 0,
    required: false
  })
  minVolume?: number;
}

// Success responses
export class ScrapingSuccessResponse {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Time taken to complete the operation in milliseconds',
    example: 5432
  })
  duration: number;

  @ApiProperty({
    description: 'Summary of the scraping operation',
    type: ScrapingSummaryResponse
  })
  summary: ScrapingSummaryResponse;
}
