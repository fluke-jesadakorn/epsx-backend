import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from './common.swagger';

export class ExchangeDto {
  @ApiProperty({
    type: String,
    example: '65d1e9b1c445f6f5c8d9a1b2',
    description: 'MongoDB ObjectId',
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
    example: 'NYSE',
    required: true,
  })
  market_code: string;

  @ApiProperty({
    type: String,
    example: 'New York Stock Exchange',
    required: true,
  })
  exchange_name: string;

  @ApiProperty({
    type: String,
    example: 'The New York Stock Exchange is the world\'s largest stock exchange.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: String,
    example: 'North America',
    required: false,
  })
  region?: string;

  @ApiProperty({
    type: String,
    example: 'America/New_York',
    required: false,
  })
  timezone?: string;

  @ApiProperty({
    type: [String],
    example: ['65d1e9b1c445f6f5c8d9a1b3', '65d1e9b1c445f6f5c8d9a1b4'],
    description: 'Array of Stock ObjectIds',
    required: false,
  })
  stocks?: string[];
}

export class CreateExchangeRequest extends ExchangeDto {}

export class UpdateExchangeRequest implements Partial<ExchangeDto> {
  @ApiProperty({
    type: String,
    example: 'New York Stock Exchange',
    required: false,
  })
  exchange_name?: string;

  @ApiProperty({
    type: String,
    example: 'The New York Stock Exchange is the world\'s largest stock exchange.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: String,
    example: 'North America',
    required: false,
  })
  region?: string;

  @ApiProperty({
    type: String,
    example: 'America/New_York',
    required: false,
  })
  timezone?: string;

  @ApiProperty({
    type: String,
    example: 'jane.doe@example.com',
    required: false,
  })
  edit_by?: string;
}

export class ExchangeResponse extends ExchangeDto {
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

  @ApiProperty({
    type: [String],
    example: ['65d1e9b1c445f6f5c8d9a1b3', '65d1e9b1c445f6f5c8d9a1b4'],
    description: 'Array of Stock ObjectIds',
  })
  stocks: string[];
}

export class PaginatedExchangeResponse extends PaginatedResponse<ExchangeResponse> {}

export class ScrapeExchangeResponse {
  @ApiProperty({
    type: Number,
    example: 5,
  })
  exchangesScraped: number;

  @ApiProperty({
    type: [String],
    example: ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'SSE'],
  })
  marketCodes: string[];

  @ApiProperty({
    type: String,
    example: '2024-02-15T04:11:16.789Z',
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
