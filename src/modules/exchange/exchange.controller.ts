import { Controller, Get } from '@nestjs/common';
import { ExchangeService } from './exchange.service';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('scrape')
  async scrapeExchanges() {
    return this.exchangeService.scrapeAndSaveExchanges();
  }
}
