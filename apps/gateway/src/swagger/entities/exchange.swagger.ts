import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from './common.swagger';

export class ExchangeDto {
  @ApiProperty({
    type: String,
    example: 'New York Stock Exchange'
  })
  exchange_name: string;

  @ApiProperty({
    type: String,
    example: 'United States'
  })
  country: string;

  @ApiProperty({
    type: String,
    example: 'NYSE'
  })
  market_code: string;

  @ApiProperty({
    type: String,
    example: 'USD'
  })
  currency: string;

  @ApiProperty({
    type: String,
    example: 'https://www.nyse.com'
  })
  exchange_url: string;

  @ApiProperty({
    type: String,
    example: 'America/New_York'
  })
  timezone: string;
}

export class CreateExchangeRequest extends ExchangeDto {}

export class UpdateExchangeRequest implements Partial<ExchangeDto> {
  @ApiProperty({
    type: String,
    example: 'New York Stock Exchange',
    required: false
  })
  exchange_name?: string;

  @ApiProperty({
    type: String,
    example: 'United States',
    required: false
  })
  country?: string;

  @ApiProperty({
    type: String,
    example: 'https://www.nyse.com',
    required: false
  })
  exchange_url?: string;

  @ApiProperty({
    type: String,
    example: 'America/New_York',
    required: false
  })
  timezone?: string;
}

export class ExchangeResponse extends ExchangeDto {
  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z'
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z'
  })
  updatedAt: string;
}

export class PaginatedExchangeResponse extends PaginatedResponse {
  @ApiProperty({
    type: [ExchangeResponse]
  })
  data: ExchangeResponse[];
}

export class ScrapeExchangeResponse {
  @ApiProperty({
    type: Number,
    example: 5
  })
  exchangesScraped: number;

  @ApiProperty({
    type: [String],
    example: ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'SSE']
  })
  marketCodes: string[];

  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z'
  })
  lastScrapedAt: string;
}

// Future Features Documentation
/**
 * TODO: Add documentation for future features:
 * - Real-time exchange rate types
 * - Market status response types
 * - Trading hours response types
 * - Holiday calendar types
 * - Exchange statistics types
 * - Market indices types
 * - Exchange notifications/alerts types
 */
