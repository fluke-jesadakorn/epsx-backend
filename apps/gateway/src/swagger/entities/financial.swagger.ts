import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from './common.swagger';

export class FinancialMetricsDto {
  @ApiProperty({
    type: Number,
    example: 1000000000
  })
  revenue?: number;

  @ApiProperty({
    type: Number,
    example: 15.5
  })
  revenue_growth?: number;

  @ApiProperty({
    type: Number,
    example: 300000000
  })
  operating_income?: number;

  @ApiProperty({
    type: Number,
    example: 250000000
  })
  net_income?: number;

  @ApiProperty({
    type: Number,
    example: 12.3
  })
  net_income_growth?: number;

  @ApiProperty({
    type: Number,
    example: 2.5
  })
  eps_basic?: number;

  @ApiProperty({
    type: Number,
    example: 2.45
  })
  eps_diluted?: number;

  @ApiProperty({
    type: Number,
    example: 18.7
  })
  eps_growth?: number;

  @ApiProperty({
    type: Number,
    example: 400000000
  })
  free_cash_flow?: number;

  @ApiProperty({
    type: Number,
    example: 0.75
  })
  dividend_per_share?: number;

  @ApiProperty({
    type: Number,
    example: 25.5
  })
  profit_margin?: number;

  @ApiProperty({
    type: Number,
    example: 450000000
  })
  ebitda?: number;

  @ApiProperty({
    type: Number,
    example: 32.8
  })
  ebitda_margin?: number;
}

export class FinancialReportDto extends FinancialMetricsDto {
  @ApiProperty({
    type: String,
    example: '2024-01-31'
  })
  report_date: string;

  @ApiProperty({
    type: Number,
    example: 4
  })
  fiscal_quarter: number;

  @ApiProperty({
    type: Number,
    example: 2023
  })
  fiscal_year: number;

  @ApiProperty({
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  stock: string;
}

export class EPSGrowthRankingResponse extends PaginatedResponse {
  @ApiProperty({
    type: [Object],
    example: [
      {
        symbol: 'AAPL',
        company_name: 'Apple Inc.',
        eps_growth: 15.7,
        eps_ttm: 6.42,
        eps_next_quarter: 7.1
      }
    ]
  })
  data: Array<{
    symbol: string;
    company_name: string;
    eps_growth: number;
    eps_ttm: number;
    eps_next_quarter: number;
  }>;
}

export class FetchFinancialsResponse {
  @ApiProperty({
    type: Number,
    example: 500
  })
  companiesProcessed: number;

  @ApiProperty({
    type: Number,
    example: 2000
  })
  reportsGenerated: number;

  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z'
  })
  lastProcessedAt: string;

  @ApiProperty({
    type: Object,
    example: {
      success: 495,
      failed: 5,
      skipped: 0
    }
  })
  statistics: {
    success: number;
    failed: number;
    skipped: number;
  };
}

// Future Features Documentation
/**
 * TODO: Add documentation for future features:
 * - Historical financial data comparison types
 * - Financial ratios and metrics types
 * - Financial statements types (Balance Sheet, Cash Flow)
 * - Industry comparison response types
 * - Financial forecasts types
 * - Custom financial metric types
 * - Financial alert/notification types
 * - Data validation response types
 */
