import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';
import { PaginationParams, StockScreenerResponse } from './interfaces/common.interfaces';

@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @MessagePattern({ cmd: 'getAllStocks' })
  async getAllStocks(@Payload() params: PaginationParams) {
    return this.stockService.getAllStocks(params);
  }

  @MessagePattern({ cmd: 'getStocksByExchange' })
  async getStocksByExchange(
    @Payload() data: { exchangeId: string; params: PaginationParams },
  ) {
    return this.stockService.getStocksByExchange(data.exchangeId, data.params);
  }

  @MessagePattern({ cmd: 'getStockBySymbol' })
  async getStockBySymbol(@Payload() symbol: string) {
    return this.stockService.getStockBySymbol(symbol);
  }

  @MessagePattern({ cmd: 'saveStockData' })
  async saveStockData(
    @Payload() data: { exchangeId: string; stockData: StockScreenerResponse },
  ) {
    return this.stockService.saveStockData(data.exchangeId, data.stockData);
  }

  // TODO: Add message patterns for:
  // - Real-time price updates
  // - Historical data queries
  // - Technical analysis requests
  // - Market indicators
  // - Stock performance metrics

  // Future enhancement: Add event patterns for real-time updates
  // @EventPattern('stock.price.update')
  // async handlePriceUpdate(@Payload() data: any) {
  //   return this.stockService.handlePriceUpdate(data);
  // }
}
