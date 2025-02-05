import { Controller, Get, Query, Req } from '@nestjs/common';
import { PaginatedResponse, EPSGrowthResult } from '../../types';
import { FinancialService } from './financial.service';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    roles: string[];
  };
}

@ApiTags('Financial')
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('scrape')
  @ApiOperation({
    summary: 'Scrape financial data',
    description: 'Fetches and saves financial data from external sources'
  })
  @ApiResponse({
    status: 200,
    description: 'Financial data scraped successfully',
    content: {
      'application/json': {
        example: {
          success: true,
          message: 'Financial data scraped and saved successfully',
          count: 100
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'Failed to scrape financial data',
          error: 'Internal Server Error'
        }
      }
    }
  })
  async scrapeFinancials() {
    return this.financialService.fetchAndSaveFinancials();
  }

  /**
   * Get stocks ranked by EPS growth with pagination support
   * @param limit Maximum number of results to return (default: 20)
   * @param skip Number of results to skip for pagination (default: 0)
   * @returns Paginated array of stocks with their EPS growth percentages
   */
  @Get('eps-growth-ranking')
  @ApiOperation({
    summary: 'Get EPS growth rankings',
    description: 'Get stocks ranked by EPS growth with pagination support'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results to return (default: 20, max: 100)'
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of results to skip for pagination (default: 0)'
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
              name: 'Apple Inc.',
              epsGrowth: 25.5,
              rank: 1
            },
            {
              symbol: 'GOOGL',
              name: 'Alphabet Inc.',
              epsGrowth: 20.3,
              rank: 2
            }
          ],
          total: 100,
          limit: 20,
          skip: 0
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized access',
          error: 'Unauthorized'
        }
      }
    }
  })
  async getEPSGrowthRanking(
    @Req() req: Request,
    @Query('limit') limitStr?: string,
    @Query('skip') skipStr?: string,
  ): Promise<PaginatedResponse<EPSGrowthResult>> {
    // TODO: Implement middleware for Authorization, RBAC, and Authentication
    const limit = limitStr
      ? Math.max(1, Math.min(100, parseInt(limitStr)))
      : 20;
    const skip = skipStr ? Math.max(0, parseInt(skipStr)) : 0;
    console.log(req.cookies);

    const userId = (req as AuthenticatedRequest).user?.id || 'service_role';
    return await this.financialService.getEPSGrowthRanking(limit, skip);
  }
}
