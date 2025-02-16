import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from './common.swagger';

export class StockDto {
  @ApiProperty({
    type: String,
    example: 'AAPL'
  })
  symbol: string;

  @ApiProperty({
    type: String,
    example: 'Apple Inc.'
  })
  company_name: string;

  @ApiProperty({
    type: String,
    example: '507f1f77bcf86cd799439011'
  })
  exchange: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-02-15T04:11:16.789Z'
  })
  last_updated?: Date;
}

export class StockResponse extends StockDto {
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-02-15T04:11:16.789Z'
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-02-15T04:11:16.789Z'
  })
  updatedAt: string;
}

export class PaginatedStockResponse extends PaginatedResponse {
  @ApiProperty({
    type: [StockResponse]
  })
  data: StockResponse[];
}

export class StockScreenerResponseDto {
  @ApiProperty({
    type: String,
    example: 'NYSE'
  })
  exchange: string;

  @ApiProperty({
    type: [Object],
    example: [
      {
        symbol: 'AAPL',
        company_name: 'Apple Inc.',
        current_price: 175.84,
        change_percent: 2.45,
        volume: 65432100,
        market_cap: 2850000000000
      }
    ]
  })
  stocks: Array<{
    symbol: string;
    company_name: string;
    current_price?: number;
    change_percent?: number;
    volume?: number;
    market_cap?: number;
  }>;

  @ApiProperty({
    type: Object,
    example: {
      processed: 100,
      invalid: 0,
      total: 100
    }
  })
  metadata: {
    processed: number;
    invalid: number;
    total: number;
  };

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2024-02-15T04:11:16.789Z'
  })
  scrapedAt: string;
}

// Future Features Documentation
/**
 * TODO: Add documentation for future features:
 * - Real-time price update types
 * - Historical OHLCV data types
 * - Technical indicators response types
 * - Market breadth analysis types
 * - Volatility indices types
 * - Stock performance metrics types
 * - Trading signals response types
 * - WebSocket streaming types
 * - Chart pattern analysis types
 * - Custom stock screener types
 */

// Future Properties for Stock DTO:
/**
 * @ApiProperty() market_cap?: number;
 * @ApiProperty() volume?: number;
 * @ApiProperty() pe_ratio?: number;
 * @ApiProperty() dividend_yield?: number;
 * @ApiProperty() price_history?: { date: Date; price: number }[];
 */
