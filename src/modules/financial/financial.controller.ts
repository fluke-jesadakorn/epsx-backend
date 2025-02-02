import { Controller, Get } from '@nestjs/common';
import { FinancialService } from './financial.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('scrape')
  async scrapeFinancials() {
    return this.financialService.fetchAndSaveFinancials();
  }
}
