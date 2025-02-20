import {
  Controller,
  Inject,
  Post,
  Get,
  Query,
  Param,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { 
  EpsGrowthRankingResponseDto, 
  StartEPSGrowthProcessingResponseDto, 
  EPSGrowthProcessingStatusDto,
  CalculateAndSaveAllEPSGrowthResponseDto,
  GetEPSGrowthRankingParamsDto,
  GetEPSGrowthRankingResponseDto
} from '../swagger/entities/financial.swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Financial')
@Controller('financial')
export class FinancialController implements OnModuleInit {
  private readonly logger = new Logger(FinancialController.name);
  constructor(
    @Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy,
  ) {}

  onModuleInit() {
    this.financialService.connect();
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Scrape financial data' })
  @ApiResponse({
    status: 200,
    description: 'Financial data scraped successfully.',
  })
  async scrapeFinancialData() {
    this.logger.log('Initiating financial data scraping from gateway');
    const response = await firstValueFrom(
      this.financialService.send({ cmd: 'scrapeFinancialData' }, {}),
    );
    this.logger.log(
      'Financial data scraping request sent to financial service',
    );
    return response;
  }

  @Post('eps-growth/process')
  @ApiOperation({ summary: 'Start EPS growth data processing' })
  @ApiResponse({
    status: 201,
    description: 'EPS growth processing started successfully',
    type: StartEPSGrowthProcessingResponseDto,
  })
  async startEPSGrowthProcessing() {
    this.logger.log('Starting EPS growth processing');
    return await firstValueFrom(
      this.financialService.send({ cmd: 'startEPSGrowthProcessing' }, {}),
    );
  }

  @Get('eps-growth/status/:processingId')
  @ApiOperation({ summary: 'Get EPS growth processing status' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current status of EPS growth processing',
    type: EPSGrowthProcessingStatusDto,
  })
  @ApiParam({
    name: 'processingId',
    description: 'ID of the EPS growth processing job',
    type: String,
    example: '65d1e9b1c445f6f5c8d9a1b2'
  })
  async getEPSGrowthProcessingStatus(@Param('processingId') processingId: string) {
    return await firstValueFrom(
      this.financialService.send(
        { cmd: 'getEPSGrowthProcessingStatus' },
        { processingId },
      ),
    );
  }

  @Post('eps-growth/calculate')
  @ApiOperation({ summary: 'Calculate and save EPS growth for all financial records' })
  @ApiResponse({
    status: 201,
    description: 'EPS growth calculation and saving process completed',
    type: CalculateAndSaveAllEPSGrowthResponseDto,
  })
  async calculateAndSaveAllEPSGrowth() {
    this.logger.log('Starting batch EPS growth calculation');
    return await firstValueFrom(
      this.financialService.send({ cmd: 'calculateAndSaveAllEPSGrowth' }, {}),
    );
  }

  @Get('eps-growth/ranking')
  @ApiOperation({ summary: 'Get EPS growth ranking from pre-calculated data' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered and sorted EPS growth ranking data',
    type: GetEPSGrowthRankingResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'market_code',
    required: false,
    type: String,
    description: 'Market code to filter by',
    example: 'SET',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'eps_growth',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (asc/desc)',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  async getEPSGrowthRanking(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('market_code') market_code?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pattern = { cmd: 'getEPSGrowthRanking' };
    const payload = { limit, skip, market_code, sortBy, sortOrder };
    return await firstValueFrom(
      this.financialService.send(pattern, payload),
    );
  }

  @Get('getEPSGrowthRankingOnceQuarter')
  @ApiOperation({ 
    summary: 'Get EPS growth ranking (Legacy)',
    description: 'DEPRECATED: Use /eps-growth/ranking instead. This endpoint will be removed in future versions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated EPS growth ranking data',
    type: EpsGrowthRankingResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  async getEPSGrowthRankingOnceQuarter(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const pattern = { cmd: 'getEPSGrowthRankingOnceQuarter' };
    const payload = { limit, skip };
    const response = await firstValueFrom(
      this.financialService.send(pattern, payload),
    );
    return response;
  }
}
