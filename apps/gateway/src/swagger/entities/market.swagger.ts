import { ApiProperty } from '@nestjs/swagger';

// Base DTO with common fields
class BaseDto {
  @ApiProperty({ description: 'Created by user ID', required: false })
  create_by?: string;

  @ApiProperty({ description: 'Last edited by user ID', required: false })
  edit_by?: string;

  @ApiProperty({ description: 'Deleted by user ID', required: false })
  delete_by?: string;

  @ApiProperty({ description: 'Document version for optimistic locking', default: 1 })
  version?: number;
}

// Exchange DTOs
export class CreateExchangeDto extends BaseDto {
  @ApiProperty({ description: 'Unique market code identifier', example: 'SET' })
  market_code: string;

  @ApiProperty({ description: 'Full name of the exchange', example: 'Stock Exchange of Thailand' })
  exchange_name: string;

  @ApiProperty({ description: 'Description of the exchange', required: false })
  description?: string;

  @ApiProperty({ description: 'Geographic region of the exchange', example: 'Asia', required: false })
  region?: string;

  @ApiProperty({ description: 'Timezone of the exchange', example: 'Asia/Bangkok', required: false })
  timezone?: string;
}

export class ExchangeResponseDto extends CreateExchangeDto {
  @ApiProperty({ description: 'List of stock IDs associated with this exchange' })
  stocks: string[];
}

// Stock DTOs
export class CreateStockDto extends BaseDto {
  @ApiProperty({ description: 'Stock ticker symbol', example: 'AOT' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Airports of Thailand PCL', required: false })
  company_name?: string;

  @ApiProperty({ description: 'Exchange ID this stock belongs to' })
  exchange: string;

  @ApiProperty({ description: 'Business sector', example: 'Transportation', required: false })
  sector?: string;

  @ApiProperty({ description: 'Specific industry', example: 'Airport Services', required: false })
  industry?: string;

  @ApiProperty({ description: 'Market capitalization in base currency', example: 1000000000, required: false })
  market_cap?: number;

  @ApiProperty({ description: 'Company website URL', example: 'https://www.airportthai.co.th', required: false })
  website?: string;
}

export class StockResponseDto extends CreateStockDto {
  @ApiProperty({ description: 'List of financial report IDs associated with this stock' })
  financial: string[];
}

// Financial DTOs
export class FinancialReportDto extends BaseDto {
  @ApiProperty({ description: 'Associated stock ID' })
  stock: string;

  @ApiProperty({ description: 'Report date', example: '2024-12-31' })
  report_date: Date;

  @ApiProperty({ description: 'Fiscal quarter (1-4)', example: 4 })
  fiscal_quarter: number;

  @ApiProperty({ description: 'Fiscal year', example: 2024 })
  fiscal_year: number;

  @ApiProperty({ description: 'Total revenue', example: 1000000000 })
  revenue?: number;

  @ApiProperty({ description: 'Year-over-year revenue growth percentage', example: 15.5 })
  revenue_growth?: number;

  @ApiProperty({ description: 'Basic earnings per share', example: 2.5 })
  eps_basic?: number;

  @ApiProperty({ description: 'Diluted earnings per share', example: 2.45 })
  eps_diluted?: number;

  @ApiProperty({ description: 'Year-over-year EPS growth percentage', example: 12.3 })
  eps_growth?: number;

  @ApiProperty({ description: 'EBITDA value', example: 800000000 })
  ebitda?: number;

  @ApiProperty({ description: 'EBITDA margin percentage', example: 25.5 })
  ebitda_margin?: number;
}

// Query DTOs
export class PaginationQueryDto {
  @ApiProperty({ description: 'Number of records to skip', required: false, minimum: 0 })
  skip?: number;

  @ApiProperty({ description: 'Number of records to return', required: false, minimum: 1, maximum: 100 })
  limit?: number;
}

export class ScrapeStocksDto {
  @ApiProperty({ 
    description: 'List of exchange IDs to scrape stocks from. If empty, scrapes from all exchanges.',
    required: false,
    type: [String]
  })
  exchangeIds?: string[];
}

// Response DTOs
export class EPSGrowthResponseDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AOT' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Airports of Thailand PCL' })
  company_name: string;

  @ApiProperty({ description: 'EPS growth percentage', example: 15.5 })
  eps_growth: number;

  @ApiProperty({ description: 'Latest report date', example: '2024-12-31' })
  report_date: Date;
}

export class ScrapingResponseDto {
  @ApiProperty({ description: 'Number of records processed', example: 100 })
  processed: number;

  @ApiProperty({ description: 'Number of records successfully updated', example: 95 })
  success: number;

  @ApiProperty({ description: 'Number of records that failed', example: 5 })
  failed: number;

  @ApiProperty({ description: 'Error messages if any', required: false, type: [String] })
  errors?: string[];
}

// Error DTOs
export class MarketErrorResponseDto {
  @ApiProperty({ description: 'Error status code', example: 404 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Stock not found' })
  message: string;

  @ApiProperty({ description: 'Error description', example: 'The requested stock symbol does not exist' })
  error: string;
}
