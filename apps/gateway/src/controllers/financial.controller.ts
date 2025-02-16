import { Controller, Get, Post, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { PaginationParamsDto } from '@investing/common';

@ApiTags('Financial Data')
@Controller('financial')
export class FinancialController {
  constructor(
    @Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy,
  ) {}

  @Get('eps-growth')
  @ApiOperation({ summary: 'Get EPS growth ranking with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved EPS growth ranking' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEPSGrowthRanking(@Query() params: PaginationParamsDto = {}) {
    return firstValueFrom(
      this.financialService.send({ cmd: 'get_eps_growth_ranking' }, params)
    );
  }

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch and save financial data' })
  @ApiResponse({ status: 200, description: 'Successfully fetched financial data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchFinancials() {
    return firstValueFrom(
      this.financialService.send({ cmd: 'fetch_financials' }, {})
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Check financial service health' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        service: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  async healthCheck() {
    return firstValueFrom(
      this.financialService.send({ cmd: 'health_check' }, {})
    );
  }

  // TODO: Add endpoints for:
  // - Historical financial data
  // - Financial ratios and metrics
  // - Company financial statements
  // - Industry comparisons
  // - Financial forecasts and projections
}
