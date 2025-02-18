import { Controller, Inject, Post, Get, Query, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EpsGrowthRankingResponseDto } from '../swagger/entities/financial.swagger';
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

  @Get('eps-growth-ranking')
  @ApiOperation({ summary: 'Get EPS growth ranking' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated EPS growth ranking data',
    type: EpsGrowthRankingResponseDto,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of items to skip' })
  async getEpsGrowthRanking(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const pattern = { cmd: 'getEpsGrowthRanking' };
    const payload = { limit, skip };
    const response = await firstValueFrom(
      this.financialService.send(pattern, payload),
    );
    return response;
  }
}
