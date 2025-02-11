import { Controller, Get } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('scrape')
  @ApiOperation({
    summary: 'Scrape exchange data',
    description:
      'Fetches and saves exchange data including trading hours, holidays, and market status',
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange data scraped successfully',
    content: {
      'application/json': {
        example: {
          success: true,
          message: 'Exchange data scraped and saved successfully',
          data: [
            {
              name: 'NYSE',
              code: 'NYSE',
              country: 'United States',
              timezone: 'America/New_York',
              openTime: '09:30',
              closeTime: '16:00',
              status: 'open',
            },
            {
              name: 'NASDAQ',
              code: 'NASDAQ',
              country: 'United States',
              timezone: 'America/New_York',
              openTime: '09:30',
              closeTime: '16:00',
              status: 'open',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'Failed to scrape exchange data',
          error: 'Internal Server Error',
        },
      },
    },
  })
  async scrapeExchanges() {
    return this.exchangeService.scrapeAndSaveExchanges();
  }
}
