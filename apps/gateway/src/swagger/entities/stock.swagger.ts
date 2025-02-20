import { ApiProperty } from '@nestjs/swagger';

export class StockDto {
  @ApiProperty({
    type: String,
    example: '65d1e9b1c445f6f5c8d9a1b2',
    description: 'MongoDB ObjectId'
  })
  _id: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
    required: false,
  })
  create_by?: string;

  @ApiProperty({
    type: String,
    example: 'jane.doe@example.com',
    required: false,
  })
  edit_by?: string;

  @ApiProperty({
    type: String,
    example: 'admin@example.com',
    required: false,
  })
  delete_by?: string;

  @ApiProperty({
    type: Number,
    example: 1,
    default: 1,
    required: false,
  })
  version?: number;

  @ApiProperty({
    type: String,
    example: 'AAPL',
    required: true,
  })
  symbol: string;

  @ApiProperty({
    type: String,
    example: 'Apple Inc.',
    required: false,
  })
  company_name?: string;

  @ApiProperty({
    type: [String],
    example: ['65d1e9b1c445f6f5c8d9a1b3', '65d1e9b1c445f6f5c8d9a1b4'],
    description: 'Array of Financial ObjectIds',
    required: false,
  })
  financial?: string[];

  @ApiProperty({
    type: String,
    example: '65d1e9b1c445f6f5c8d9a1b5',
    description: 'Exchange ObjectId',
    required: true,
  })
  exchange: string;

  @ApiProperty({
    type: String,
    example: 'Technology',
    required: false,
  })
  sector?: string;

  @ApiProperty({
    type: String,
    example: 'Consumer Electronics',
    required: false,
  })
  industry?: string;

  @ApiProperty({
    type: Number,
    example: 2850000000000,
    description: 'Market capitalization in USD',
    required: false,
  })
  market_cap?: number;

  @ApiProperty({
    type: String,
    example: 'https://www.apple.com',
    required: false,
  })
  website?: string;
}

export class CreateStockRequest extends StockDto {}

export class UpdateStockRequest implements Partial<StockDto> {
  @ApiProperty({
    type: String,
    example: 'Apple Inc.',
    required: false,
  })
  company_name?: string;

  @ApiProperty({
    type: String,
    example: 'Technology',
    required: false,
  })
  sector?: string;

  @ApiProperty({
    type: String,
    example: 'Consumer Electronics',
    required: false,
  })
  industry?: string;

  @ApiProperty({
    type: Number,
    example: 2850000000000,
    required: false,
  })
  market_cap?: number;

  @ApiProperty({
    type: String,
    example: 'https://www.apple.com',
    required: false,
  })
  website?: string;

  @ApiProperty({
    type: String,
    example: 'jane.doe@example.com',
    required: false,
  })
  edit_by?: string;
}

export class StockResponse extends StockDto {
  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z',
  })
  updatedAt: string;
}

export class PaginatedStockResponse {
  @ApiProperty({ 
    description: 'Total number of items',
    example: 100
  })
  total: number;

  @ApiProperty({ 
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({ 
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({ 
    description: 'List of stocks', 
    type: [StockResponse] 
  })
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
    minimum: 0,
  })
  totalExchanges: number;

  @ApiProperty({
    description: 'Number of exchanges successfully processed without errors',
    example: 4,
    minimum: 0,
  })
  processedExchanges: number;

  @ApiProperty({
    description: 'Total number of stocks found across all exchanges',
    example: 1000,
    minimum: 0,
  })
  totalStocks: number;

  @ApiProperty({
    description: 'Number of new unique stocks added to the database',
    example: 50,
    minimum: 0,
  })
  newStocks: number;

  @ApiProperty({
    description:
      'Number of exchanges that encountered errors during processing',
    example: 1,
    minimum: 0,
  })
  failedExchanges: number;

  @ApiProperty({
    description: 'Detailed error messages for failed operations',
    example: [
      'Failed to fetch data for NYSE: Rate limit exceeded',
      'Invalid data format received for NASDAQ',
    ],
    isArray: true,
  })
  errors: string[];
}

export class StockScreenerFilters {
  @ApiProperty({
    description: 'Industry sectors to include',
    example: ['Technology', 'Healthcare', 'Finance'],
    isArray: true,
    required: false,
  })
  sectors?: string[];

  @ApiProperty({
    description: 'Geographic regions to filter by',
    example: ['North America', 'APAC', 'Europe'],
    isArray: true,
    required: false,
  })
  regions?: string[];

  @ApiProperty({
    description: 'Minimum market capitalization in millions USD',
    example: 1000,
    minimum: 0,
    required: false,
  })
  minMarketCap?: number;

  @ApiProperty({
    description: 'Minimum daily trading volume',
    example: 100000,
    minimum: 0,
    required: false,
  })
  minVolume?: number;
}

// Success responses
export class ScrapingSuccessResponse {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Time taken to complete the operation in milliseconds',
    example: 5432,
  })
  duration: number;

  @ApiProperty({
    description: 'Summary of the scraping operation',
    type: ScrapingSummaryResponse,
  })
  summary: ScrapingSummaryResponse;
}
