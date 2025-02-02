import { Controller, Get, Query, Req } from '@nestjs/common';
import { PaginatedResponse } from '../../types';
import { FinancialService, EPSGrowthResult } from './financial.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    roles: string[];
  };
}

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('scrape')
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

    return await this.financialService.getEPSGrowthRanking(limit, skip);
  }
}
