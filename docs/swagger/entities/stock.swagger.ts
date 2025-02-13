import { ApiProperty } from '@nestjs/swagger';
import { CommonEntitySwagger } from './common.swagger';
import { ExchangeSwagger } from './exchange.swagger';
import { FinancialSwagger } from './financial.swagger';

export const StockMetadataExample = {
  website: 'https://www.apple.com',
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
  employees: 154000,
  founded: 1976,
  ceo: 'Tim Cook',
  headquarters: 'Cupertino, California, USA'
};

export const StockResponseExample = {
  _id: '507f1f77bcf86cd799439012',
  symbol: 'AAPL',
  company_name: 'Apple Inc.',
  sector: 'Technology',
  metadata: StockMetadataExample,
  primary_exchange_market_code: 'NASDAQ',
  exchanges: {
    _id: '507f1f77bcf86cd799439013',
    market_code: 'NASDAQ',
    name: 'NASDAQ Stock Market'
  },
  financials: [{
    _id: '507f1f77bcf86cd799439011',
    revenue: 100000000,
    fiscal_quarter: 4,
    fiscal_year: 2024
  }],
  version: 1,
  createdAt: '2024-02-09T09:00:00Z',
  updatedAt: '2024-02-09T10:00:00Z'
};

export class StockMetadataSwagger {
  @ApiProperty({
    description: 'Company website URL',
    example: 'https://www.apple.com',
    required: false
  })
  website?: string;

  static example = StockMetadataExample;

  @ApiProperty({
    description: 'Company description',
    example: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'Number of employees',
    example: 154000,
    required: false
  })
  employees?: number;

  @ApiProperty({
    description: 'Year company was founded',
    example: 1976,
    required: false
  })
  founded?: number;

  @ApiProperty({
    description: 'Current CEO name',
    example: 'Tim Cook',
    required: false
  })
  ceo?: string;

  @ApiProperty({
    description: 'Company headquarters location',
    example: 'Cupertino, California, USA',
    required: false
  })
  headquarters?: string;
}

export class StockSwagger extends CommonEntitySwagger {
  @ApiProperty({
    description: 'Stock ticker symbol',
    example: 'AAPL',
    required: true
  })
  symbol: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Apple Inc.',
    required: true
  })
  company_name: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false
  })
  sector?: string;

  @ApiProperty({
    description: 'Company metadata',
    type: () => StockMetadataSwagger,
    required: false
  })
  metadata?: StockMetadataSwagger;

  @ApiProperty({
    description: 'Market code of the primary exchange',
    example: 'NASDAQ',
    required: false
  })
  primary_exchange_market_code?: string;

  @ApiProperty({
    description: 'Exchange where the stock is listed',
    type: () => ExchangeSwagger,
    required: true,
    example: {
      _id: '507f1f77bcf86cd799439013',
      market_code: 'NASDAQ',
      name: 'NASDAQ Stock Market'
    }
  })
  exchanges: ExchangeSwagger;

  @ApiProperty({
    description: 'Financial reports for this stock',
    type: () => [FinancialSwagger],
    required: false,
    example: [{
      _id: '507f1f77bcf86cd799439011',
      revenue: 100000000,
      fiscal_quarter: 4,
      fiscal_year: 2024
    }]
  })
  financials?: FinancialSwagger[];

  static example = StockResponseExample;
}
