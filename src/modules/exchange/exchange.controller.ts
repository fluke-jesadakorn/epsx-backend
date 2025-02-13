import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExchangeService } from './exchange.service';

@Controller()
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @MessagePattern('scrape_exchanges')
  async scrapeExchanges() {
    return this.exchangeService.scrapeAndSaveExchanges();
  }
}
