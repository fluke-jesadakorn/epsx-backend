import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StockService } from './stock.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stock')
@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @MessagePattern('scrape_stocks')
  async scrapeStocks() {
    return this.stockService.saveStockData();
  }
}
