import { ApiProperty } from '@nestjs/swagger';
import { CommonEntitySwagger } from './common.swagger';

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
    type: () => 'Stock[]',
    required: false
  })
  stocks?: any[];
}
