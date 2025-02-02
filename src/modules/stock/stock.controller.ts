import { Controller, Get } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('scrape')
  async scrapeStocks() {
    return this.stockService.saveStockData();
  }
}
