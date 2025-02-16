import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExchangeService } from './exchange.service';
import { Exchange } from './schemas/exchange.schema';

@Controller()
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @MessagePattern({ cmd: 'createExchange' })
  async create(exchangeData: Partial<Exchange>) {
    return this.exchangeService.create(exchangeData);
  }

  @MessagePattern({ cmd: 'findAllExchanges' })
  async findAll(data: { page: number; limit: number }) {
    const skip = (data.page - 1) * data.limit;
    return this.exchangeService.findAll(skip, +data.limit);
  }

  @MessagePattern({ cmd: 'findOneExchange' })
  async findOne(marketCode: string) {
    return this.exchangeService.findOne(marketCode);
  }

  @MessagePattern({ cmd: 'updateExchange' })
  async update(data: { marketCode: string; updateData: Partial<Exchange> }) {
    return this.exchangeService.update(data.marketCode, data.updateData);
  }

  @MessagePattern({ cmd: 'removeExchange' })
  async remove(marketCode: string) {
    return this.exchangeService.remove(marketCode);
  }

  @MessagePattern({ cmd: 'scrapeExchanges' })
  async scrapeExchanges() {
    return this.exchangeService.scrapeAndSaveExchanges();
  }
}
