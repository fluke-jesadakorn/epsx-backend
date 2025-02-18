import { Controller, Get, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FinancialService } from './financial.service';

@Controller()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @MessagePattern({ cmd: 'scrapeFinancialData' })
  async scrapeFinancialData(): Promise<string> {
    return await this.financialService.scrapeFinancialData();
  }

  @MessagePattern({ cmd: 'getEpsGrowthRanking' })
  async getEpsGrowthRanking(data: { limit?: number; skip?: number }) {
    // Convert payload params to numbers with defaults
    const parsedLimit = data.limit ? parseInt(data.limit.toString(), 10) : 20;
    const parsedSkip = data.skip ? parseInt(data.skip.toString(), 10) : 0;

    return await this.financialService.getEPSGrowthRanking(parsedLimit, parsedSkip);
  }
}
