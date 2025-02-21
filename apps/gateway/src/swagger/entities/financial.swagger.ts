import { ApiProperty } from '@nestjs/swagger';

/**
 * Financial Service Swagger Entities
 * This file defines the contract between the Financial service API and clients,
 * documenting all available endpoints and data structures.
 */

export class FinancialDto {
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
    type: Number,
    example: 394680000000,
    required: false,
  })
  revenue?: number;

  @ApiProperty({
    type: Number,
    example: 8.4,
    required: false,
  })
  revenue_growth?: number;

  @ApiProperty({
    type: Number,
    example: 152680000000,
    required: false,
  })
  operations_maintenance?: number;

  @ApiProperty({
    type: Number,
    example: 25640000000,
    required: false,
  })
  selling_general_admin?: number;

  @ApiProperty({
    type: Number,
    example: 11400000000,
    required: false,
  })
  depreciation_amortization?: number;

  @ApiProperty({
    type: Number,
    example: 0,
    required: false,
  })
  goodwill_amortization?: number;

  @ApiProperty({
    type: Number,
    example: 850000000,
    required: false,
  })
  bad_debts_provision?: number;

  @ApiProperty({
    type: Number,
    example: 4560000000,
    required: false,
  })
  other_operating_expenses?: number;

  @ApiProperty({
    type: Number,
    example: 195130000000,
    required: false,
  })
  total_operating_expenses?: number;

  @ApiProperty({
    type: Number,
    example: 119550000000,
    required: false,
  })
  operating_income?: number;

  @ApiProperty({
    type: Number,
    example: 3240000000,
    required: false,
  })
  interest_expense?: number;

  @ApiProperty({
    type: Number,
    example: 2850000000,
    required: false,
  })
  interest_income?: number;

  @ApiProperty({
    type: Number,
    example: 390000000,
    required: false,
  })
  net_interest_expense?: number;

  @ApiProperty({
    type: Number,
    example: 1250000000,
    required: false,
  })
  equity_investments_income?: number;

  @ApiProperty({
    type: Number,
    example: -450000000,
    required: false,
  })
  currency_exchange_gain?: number;

  @ApiProperty({
    type: Number,
    example: 760000000,
    required: false,
  })
  other_non_operating_income?: number;

  @ApiProperty({
    type: Number,
    example: 121120000000,
    required: false,
  })
  ebt_excluding_unusual?: number;

  @ApiProperty({
    type: Number,
    example: 850000000,
    required: false,
  })
  gain_on_sale_investments?: number;

  @ApiProperty({
    type: Number,
    example: 250000000,
    required: false,
  })
  gain_on_sale_assets?: number;

  @ApiProperty({
    type: Number,
    example: -1200000000,
    required: false,
  })
  asset_writedown?: number;

  @ApiProperty({
    type: Number,
    example: 450000000,
    required: false,
  })
  insurance_settlements?: number;

  @ApiProperty({
    type: Number,
    example: -350000000,
    required: false,
  })
  other_unusual_items?: number;

  @ApiProperty({
    type: Number,
    example: 121120000000,
    required: false,
  })
  pretax_income?: number;

  @ApiProperty({
    type: Number,
    example: 19380000000,
    required: false,
  })
  income_tax_expense?: number;

  @ApiProperty({
    type: Number,
    example: 101740000000,
    required: false,
  })
  earnings_continuing_ops?: number;

  @ApiProperty({
    type: Number,
    example: -250000000,
    required: false,
  })
  minority_interest?: number;

  @ApiProperty({
    type: Number,
    example: 96990000000,
    required: false,
  })
  net_income?: number;

  @ApiProperty({
    type: Number,
    example: 96990000000,
    required: false,
  })
  net_income_common?: number;

  @ApiProperty({
    type: Number,
    example: 5.2,
    required: false,
  })
  net_income_growth?: number;

  @ApiProperty({
    type: Number,
    example: 15850000000,
    required: false,
  })
  shares_basic?: number;

  @ApiProperty({
    type: Number,
    example: 15920000000,
    required: false,
  })
  shares_diluted?: number;

  @ApiProperty({
    type: Number,
    example: 6.12,
    required: false,
  })
  eps_basic?: number;

  @ApiProperty({
    type: Number,
    example: 6.09,
    required: false,
  })
  eps_diluted?: number;

  @ApiProperty({
    type: Number,
    example: 4.8,
    required: false,
  })
  eps_growth?: number;

  @ApiProperty({
    type: Number,
    example: 4.9,
    required: false,
  })
  eps_basic_growth?: number;

  @ApiProperty({
    type: Number,
    example: 110250000000,
    required: false,
  })
  free_cash_flow?: number;

  @ApiProperty({
    type: Number,
    example: 6.95,
    required: false,
  })
  free_cash_flow_per_share?: number;

  @ApiProperty({
    type: Number,
    example: 0.96,
    required: false,
  })
  dividend_per_share?: number;

  @ApiProperty({
    type: Number,
    example: 24.6,
    required: false,
  })
  profit_margin?: number;

  @ApiProperty({
    type: Number,
    example: 27.9,
    required: false,
  })
  free_cash_flow_margin?: number;

  @ApiProperty({
    type: Number,
    example: 130950000000,
    required: false,
  })
  ebitda?: number;

  @ApiProperty({
    type: Number,
    example: 33.2,
    required: false,
  })
  ebitda_margin?: number;

  @ApiProperty({
    type: Number,
    example: 11400000000,
    required: false,
  })
  depreciation_amortization_ebitda?: number;

  @ApiProperty({
    type: Number,
    example: 119550000000,
    required: false,
  })
  ebit?: number;

  @ApiProperty({
    type: Number,
    example: 30.3,
    required: false,
  })
  ebit_margin?: number;

  @ApiProperty({
    type: Number,
    example: 16,
    required: false,
  })
  effective_tax_rate?: number;

  @ApiProperty({
    type: Date,
    example: '2024-12-31',
    required: true,
  })
  report_date: Date;

  @ApiProperty({
    type: Number,
    example: 4,
    required: true,
  })
  fiscal_quarter: number;

  @ApiProperty({
    type: Number,
    example: 2024,
    required: true,
  })
  fiscal_year: number;

  @ApiProperty({
    type: String,
    example: '65d1e9b1c445f6f5c8d9a1b5',
    description: 'Stock ObjectId',
    required: true,
  })
  stock: string;
}

export class CreateFinancialRequest extends FinancialDto {}

export class UpdateFinancialRequest implements Partial<FinancialDto> {
  @ApiProperty({
    type: String,
    example: 'jane.doe@example.com',
    required: false,
  })
  edit_by?: string;
}

export class FinancialResponse extends FinancialDto {
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

export class PaginatedFinancialResponse {
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
    description: 'List of financial records', 
    type: [FinancialResponse] 
  })
  data: FinancialResponse[];
}

export class EpsGrowthDataDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Apple Inc.' })
  company_name: string;

  @ApiProperty({ description: 'Market code', example: 'NYSE' })
  market_code: string;

  @ApiProperty({ description: 'Earnings per share value', example: 6.09 })
  eps: number;

  @ApiProperty({ description: 'EPS growth percentage', example: 4.8 })
  eps_growth: number;

  @ApiProperty({ description: 'Rank position in the list', example: 1 })
  rank: number;

  @ApiProperty({ 
    description: 'Last report date',
    example: '2024-12-31'
  })
  last_report_date: string;
}

export class EpsGrowthMetadataDto {
  @ApiProperty({ description: 'Number of items to skip', example: 0 })
  skip: number;

  @ApiProperty({ description: 'Total number of records', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class EpsGrowthRankingResponseDto {
  @ApiProperty({ type: [EpsGrowthDataDto] })
  data: EpsGrowthDataDto[];

  @ApiProperty({ type: EpsGrowthMetadataDto })
  metadata: EpsGrowthMetadataDto;
}

export class FinancialFetchResponseDto {
  @ApiProperty({ 
    description: 'Status message',
    example: 'Financial data fetched successfully'
  })
  message: string;

  @ApiProperty({ 
    description: 'Operation success status',
    example: true
  })
  success: boolean;
}

export class EPSGrowthProcessingStatusDto {
  @ApiProperty({
    description: 'Total number of stocks to process',
    example: 1000
  })
  totalStocks: number;

  @ApiProperty({
    description: 'Number of stocks processed so far',
    example: 500
  })
  processedStocks: number;

  @ApiProperty({
    description: 'Whether the processing is completed',
    example: false
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Processing start time',
    example: '2025-02-20T02:27:08.000Z'
  })
  startTime: string;

  @ApiProperty({
    description: 'Processing completion time',
    example: '2025-02-20T02:35:18.000Z',
    required: false
  })
  completedTime?: string;

  @ApiProperty({
    description: 'Last processed stock symbol',
    example: 'AAPL',
    required: false
  })
  lastProcessedSymbol?: string;

  @ApiProperty({
    description: 'Current processing status',
    example: 'processing',
    enum: ['idle', 'processing', 'completed', 'error']
  })
  status: 'idle' | 'processing' | 'completed' | 'error';

  @ApiProperty({
    description: 'Error message if processing failed',
    example: 'Failed to fetch data for symbol XYZ',
    required: false
  })
  error?: string;
}

export class EPSGrowthBatchResultDto {
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Company name', example: 'Apple Inc.' })
  company_name: string;

  @ApiProperty({ description: 'Market code', example: 'NASDAQ' })
  market_code: string;

  @ApiProperty({ description: 'Earnings per share', example: 6.09 })
  eps: number;

  @ApiProperty({ description: 'EPS growth percentage', example: 4.8 })
  eps_growth: number;

  @ApiProperty({ description: 'Rank in overall results', example: 1 })
  rank: number;

  @ApiProperty({ description: 'Last financial report date', example: '2024-12-31' })
  last_report_date: string;
}

export class EPSGrowthBatchDto {
  @ApiProperty({ 
    description: 'Processing ID reference',
    example: '65d1e9b1c445f6f5c8d9a1b2'
  })
  processingId: string;

  @ApiProperty({
    description: 'Batch sequence number',
    example: 1
  })
  batchNumber: number;

  @ApiProperty({
    description: 'Stock symbols to process in this batch',
    example: ['AAPL', 'MSFT', 'GOOGL']
  })
  symbols: string[];

  @ApiProperty({
    description: 'Processed results for each symbol',
    type: [EPSGrowthBatchResultDto]
  })
  results: EPSGrowthBatchResultDto[];

  @ApiProperty({
    description: 'Whether the batch is processed',
    example: false
  })
  isProcessed: boolean;

  @ApiProperty({
    description: 'Batch processing status',
    example: 'processing',
    enum: ['pending', 'processing', 'completed', 'error']
  })
  status: 'pending' | 'processing' | 'completed' | 'error';

  @ApiProperty({
    description: 'Error message if batch processing failed',
    example: 'Failed to process batch',
    required: false
  })
  error?: string;
}

export class StartEPSGrowthProcessingResponseDto {
  @ApiProperty({
    description: 'Processing ID for tracking status',
    example: '65d1e9b1c445f6f5c8d9a1b2'
  })
  processingId: string;

  @ApiProperty({
    description: 'Initial processing status',
    type: EPSGrowthProcessingStatusDto
  })
  status: EPSGrowthProcessingStatusDto;
}

export class CalculateAndSaveAllEPSGrowthResponseDto {
  @ApiProperty({
    description: 'Operation status',
    example: 'completed'
  })
  status: string;

  @ApiProperty({
    description: 'Processing summary',
    type: 'object',
    properties: {
      processed: {
        type: 'number',
        description: 'Number of successfully processed records',
        example: 850
      },
      failed: {
        type: 'number',
        description: 'Number of failed records',
        example: 50
      },
      total: {
        type: 'number',
        description: 'Total number of records processed',
        example: 900
      }
    }
  })
  summary: {
    processed: number;
    failed: number;
    total: number;
  };
}

/**
 * Parameters for the deprecated getEPSGrowthRanking endpoint.
 * @deprecated Use GetEPSGrowthRankingV1ParamsDto instead.
 */
export class GetEPSGrowthRankingParamsDto {
  @ApiProperty({
    description: 'Number of records to return per page',
    example: 20,
    required: false,
    default: 20
  })
  limit?: number;

  @ApiProperty({
    description: 'Number of records to skip for pagination',
    example: 0,
    required: false,
    default: 0
  })
  skip?: number;
}

/**
 * Parameters for the v1 getEPSGrowthRanking endpoint.
 * Includes advanced filtering and sorting capabilities.
 */
export class GetEPSGrowthRankingV1ParamsDto {
  @ApiProperty({
    description: 'Number of records to return per page',
    example: 20,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  limit?: number;

  @ApiProperty({
    description: 'Number of records to skip for pagination',
    example: 0,
    required: false,
    default: 0,
    minimum: 0
  })
  skip?: number;

  @ApiProperty({
    description: 'Market code to filter stocks (e.g., SET, NYSE, NASDAQ)',
    example: 'SET',
    required: false
  })
  market_code?: string;

  @ApiProperty({
    description: 'Field to sort results by',
    example: 'eps_growth',
    required: false,
    default: 'eps_growth',
    enum: ['eps_growth', 'eps', 'rank']
  })
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction (ascending or descending)',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response for the deprecated getEPSGrowthRanking endpoint.
 * @deprecated Use GetEPSGrowthRankingV1ResponseDto instead.
 */
export class GetEPSGrowthRankingResponseDto {
  @ApiProperty({
    type: [EpsGrowthDataDto],
    description: 'List of EPS growth records'
  })
  data: EpsGrowthDataDto[];

  @ApiProperty({
    description: 'Response metadata',
    type: EpsGrowthMetadataDto
  })
  metadata: EpsGrowthMetadataDto;
}

/**
 * Response for the v1 getEPSGrowthRanking endpoint.
 * Includes advanced filtering and sorting results.
 */
export class GetEPSGrowthRankingV1ResponseDto {
  @ApiProperty({
    type: [EpsGrowthDataDto],
    description: 'List of filtered and sorted EPS growth records'
  })
  data: EpsGrowthDataDto[];

  @ApiProperty({
    description: 'Response metadata with pagination details',
    type: EpsGrowthMetadataDto
  })
  metadata: EpsGrowthMetadataDto;
}

export class GetEPSGrowthRankingOnceQuarterParamsDto {
  @ApiProperty({
    description: 'Number of records to return',
    example: 20,
    required: false,
    default: 20
  })
  limit?: number;

  @ApiProperty({
    description: 'Number of records to skip',
    example: 0,
    required: false,
    default: 0
  })
  skip?: number;
}

export class GetEPSGrowthRankingOnceQuarterResponseDto {
  @ApiProperty({
    type: [EpsGrowthDataDto],
    description: 'List of EPS growth records for the most recent quarter'
  })
  data: EpsGrowthDataDto[];

  @ApiProperty({
    description: 'Response metadata',
    type: EpsGrowthMetadataDto
  })
  metadata: EpsGrowthMetadataDto;
}

export class HealthCheckResponseDto {
  @ApiProperty({ 
    description: 'Service status', 
    example: 'ok' 
  })
  status: string;

  @ApiProperty({ 
    description: 'Service name', 
    example: 'financial-service' 
  })
  service: string;

  @ApiProperty({ 
    description: 'Timestamp of health check', 
    example: '2025-02-17T14:52:44.000Z' 
  })
  timestamp: string;
}
