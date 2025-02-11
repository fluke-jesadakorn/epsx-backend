import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaginationParams } from '../../types';
import { FinancialService } from './financial.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('scrape')
  @ApiOperation({
    summary: 'Scrape financial data',
    description: 'Fetches and saves financial data from external sources',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial data scraped successfully',
    content: {
      'application/json': {
        example: {
          success: true,
          message: 'Financial data scraped and saved successfully',
          count: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'Failed to scrape financial data',
          error: 'Internal Server Error',
        },
      },
    },
  })
  async scrapeFinancials() {
    try {
      const count = await this.financialService.fetchAndSaveFinancials();
      return {
        success: true,
        message: 'Financial data scraped and saved successfully',
        count,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to scrape financial data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('eps-growth-ranking')
  @ApiOperation({
    summary: 'Get EPS growth rankings',
    description: 'Get stocks ranked by EPS growth with pagination support',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort direction',
  })
  @ApiResponse({
    status: 200,
    description: 'EPS growth rankings retrieved successfully',
    content: {
      'application/json': {
        example: {
          data: [
            {
              symbol: 'AAPL',
              company_name: 'Apple Inc.',
              market_code: 'NYSE',
              exchange_name: 'New York Stock Exchange',
              eps: 3.45,
              eps_growth: 25.5,
              rank: 1,
              last_report_date: '2025-01-15',
            },
            {
              symbol: 'GOOGL',
              company_name: 'Alphabet Inc.',
              market_code: 'NASDAQ',
              exchange_name: 'NASDAQ Stock Market',
              eps: 2.89,
              eps_growth: 20.3,
              rank: 2,
              last_report_date: '2025-01-20',
            },
          ],
          metadata: {
            skip: 0,
            total: 100,
            page: 1,
            limit: 20,
            totalPages: 5,
            orderBy: 'eps_growth',
            direction: 'DESC',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized access',
          error: 'Unauthorized',
        },
      },
    },
  })
  async getEPSGrowthRanking(@Query() params: PaginationParams) {
    // Parse and validate pagination params
    return await this.financialService.getEPSGrowthRanking({
      page: params.page ? Math.max(1, parseInt(String(params.page))) : 1,
      limit: params.limit
        ? Math.max(1, Math.min(100, parseInt(String(params.limit))))
        : 20,
      orderBy: params.orderBy,
      direction: params.direction,
    });
  }
}
