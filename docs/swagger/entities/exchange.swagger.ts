import { ApiProperty } from '@nestjs/swagger';
import { CommonEntitySwagger } from './common.swagger';
import { StockSwagger } from './stock.swagger';

export const ExchangeResponseExample = {
  _id: '507f1f77bcf86cd799439013',
  market_code: 'NYSE',
  name: 'New York Stock Exchange',
  country: 'United States',
  timezone: 'America/New_York',
  open_time: '09:30',
  close_time: '16:00',
  active: true,
  description: 'The New York Stock Exchange is the largest securities exchange in the world.',
  stocks: [
    {
      _id: '507f1f77bcf86cd799439012',
      symbol: 'AAPL',
      company_name: 'Apple Inc.'
    }
  ],
  version: 1,
  createdAt: '2024-02-09T09:00:00Z',
  updatedAt: '2024-02-09T10:00:00Z'
};

export class ExchangeSwagger extends CommonEntitySwagger {
  @ApiProperty({
    description: 'Unique market code identifier for the exchange',
    example: 'NYSE',
    required: true
  })
  market_code: string;

  @ApiProperty({
    description: 'Full name of the exchange',
    example: 'New York Stock Exchange',
    required: true
  })
  name: string;

  @ApiProperty({
    description: 'Country where the exchange is located',
    example: 'United States',
    required: true
  })
  country: string;

  @ApiProperty({
    description: 'Timezone of the exchange',
    example: 'America/New_York',
    required: true
  })
  timezone: string;

  @ApiProperty({
    description: 'Opening time of the exchange (24-hour format)',
    example: '09:30',
    required: false
  })
  open_time?: string;

  @ApiProperty({
    description: 'Closing time of the exchange (24-hour format)',
    example: '16:00',
    required: false
  })
  close_time?: string;

  @ApiProperty({
    description: 'Whether the exchange is currently active',
    example: true,
    required: true
  })
  active: boolean;

  @ApiProperty({
    description: 'Detailed description of the exchange',
    example: 'The New York Stock Exchange is the largest securities exchange in the world.',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'List of stocks listed on this exchange',
    type: () => [StockSwagger],
    required: false,
    example: [{
      _id: '507f1f77bcf86cd799439012',
      symbol: 'AAPL',
      company_name: 'Apple Inc.'
    }]
  })
  stocks?: StockSwagger[];

  static example = ExchangeResponseExample;
}
