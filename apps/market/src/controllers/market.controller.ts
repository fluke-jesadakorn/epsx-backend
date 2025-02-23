import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MarketService } from '../services/market.service';
import { Exchange } from '@market/schemas';

@Controller()
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @MessagePattern({ cmd: 'createExchange' })
  createExchange(exchangeData: Partial<Exchange>) {
    return this.marketService.createExchange(exchangeData);
  }

  @MessagePattern({ cmd: 'findAllExchanges' })
  findAllExchanges(data: { skip?: number; limit?: number }) {
    const { skip, limit } = data;
    return this.marketService.findAllExchanges(skip, limit);
  }

  @MessagePattern({ cmd: 'findExchange' })
  findExchange(data: { marketCode: string }) {
    const { marketCode } = data;
    return this.marketService.findExchange(marketCode);
  }

  @MessagePattern({ cmd: 'updateExchange' })
  updateExchange(data: { marketCode: string; updateData: Partial<Exchange> }) {
    const { marketCode, updateData } = data;
    return this.marketService.updateExchange(marketCode, updateData);
  }

  @MessagePattern({ cmd: 'removeExchange' })
  removeExchange(data: { marketCode: string }) {
    const { marketCode } = data;
    return this.marketService.removeExchange(marketCode);
  }

  @MessagePattern({ cmd: 'getAllStocks' })
  getAllStocks(data: { skip?: number; limit?: number }) {
    const { skip, limit } = data;
    return this.marketService.getAllStocks(skip, limit);
  }

  @MessagePattern({ cmd: 'getStocksByExchange' })
  getStocksByExchange(data: { exchangeId: string; skip?: number; limit?: number }) {
    const { exchangeId, skip, limit } = data;
    return this.marketService.getStocksByExchange(exchangeId, skip, limit);
  }

  @MessagePattern({ cmd: 'getStockBySymbol' })
  getStockBySymbol(data: { symbol: string }) {
    const { symbol } = data;
    return this.marketService.getStockBySymbol(symbol);
  }

  @MessagePattern({ cmd: 'getEPSGrowth' })
  getEPSGrowth(data: { limit?: number; skip?: number }) {
    const { limit, skip } = data;
    return this.marketService.getEPSGrowthFromDatabase(limit, skip);
  }

  @MessagePattern({ cmd: 'scrapeExchanges' })
  scrapeExchanges() {
    return this.marketService.scrapeAndSaveExchanges();
  }

  @MessagePattern({ cmd: 'scrapeStocks' })
  scrapeStocks(data: { exchangeIds?: string[] }) {
    const { exchangeIds } = data;
    return this.marketService.scrapeStockData(exchangeIds);
  }
}
