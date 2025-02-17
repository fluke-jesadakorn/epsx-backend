import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StockService } from './stock.service';
import { PaginationParams } from './interfaces/common.interfaces';

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
  async saveStockData() {
    return this.stockService.saveStockData();
  }

  @MessagePattern({ cmd: 'scrapeStockData' })
  async scrapeStockData(@Payload() exchangeIds?: string[]) {
    return this.stockService.scrapeStockData(exchangeIds);
  }

  @MessagePattern({ cmd: 'scrapeAllStocks' })
  async scrapeAllStocks() {
    return this.stockService.scrapeAllStocks();
  }

  @MessagePattern({ cmd: 'scrapeStocksByMarketCap' })
  async scrapeStocksByMarketCap(
    @Payload() data: { minMarketCap?: number; maxMarketCap?: number },
  ) {
    return this.stockService.scrapeStocksByMarketCap(
      data.minMarketCap,
      data.maxMarketCap,
    );
  }

  @MessagePattern({ cmd: 'scrapeStocksBySector' })
  async scrapeStocksBySector(@Payload() sector: string) {
    return this.stockService.scrapeStocksBySector(sector);
  }

  @MessagePattern({ cmd: 'scrapeStocksByRegion' })
  async scrapeStocksByRegion(@Payload() region: string) {
    return this.stockService.scrapeStocksByRegion(region);
  }

  @MessagePattern({ cmd: 'scrapeStocksByVolume' })
  async scrapeStocksByVolume(@Payload() minVolume: number) {
    return this.stockService.scrapeStocksByVolume(minVolume);
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
