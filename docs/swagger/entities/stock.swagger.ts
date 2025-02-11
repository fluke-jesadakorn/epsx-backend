import { ApiProperty } from '@nestjs/swagger';
import { CommonEntitySwagger } from './common.swagger';

export class StockMetadataSwagger {
  @ApiProperty({
    description: 'Company website URL',
    example: 'https://www.apple.com',
    required: false
  })
  website?: string;

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
    type: () => 'Exchange',
    required: true
  })
  exchanges: any;

  @ApiProperty({
    description: 'Financial reports for this stock',
    type: () => 'Financial[]',
    required: false
  })
  financials?: any[];
}
