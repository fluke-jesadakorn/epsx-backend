import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FinancialService } from './financial.service';
import { PaginationParams } from './types';

@Controller()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @MessagePattern({ cmd: 'get_eps_growth_ranking' })
  async getEPSGrowthRanking(params: PaginationParams = {}) {
    return this.financialService.getEPSGrowthRanking(params);
  }

  @MessagePattern({ cmd: 'fetch_financials' })
  async fetchFinancials() {
    const totalProcessed = await this.financialService.fetchAndSaveFinancials();
    return { success: true, totalProcessed };
  }

  /**
   * Health check endpoint for the financial service
   * @returns Current status of the service
   */
  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'financial',
      timestamp: new Date().toISOString(),
    };
  }
}
