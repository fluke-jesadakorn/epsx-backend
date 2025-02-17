import { Controller, Inject, Post, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController implements OnModuleInit {
  private readonly logger = new Logger(FinancialController.name);
  constructor(@Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy) {}

  onModuleInit() {
    this.financialService.connect();
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Scrape financial data' })
  @ApiResponse({ status: 200, description: 'Financial data scraped successfully.' })
  async scrapeFinancialData() {
    this.logger.log('Initiating financial data scraping from gateway');
    const response = await firstValueFrom(
      this.financialService.send({ cmd: 'scrapeFinancialData' }, {}),
    );
    this.logger.log('Financial data scraping request sent to financial service');
    return response;
  }
}
