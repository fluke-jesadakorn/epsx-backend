import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FinancialService } from './financial.service';

@Controller()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @MessagePattern({ cmd: 'scrapeFinancialData' })
  async scrapeFinancialData(): Promise<string> {
    return await this.financialService.scrapeFinancialData();
  }
}
