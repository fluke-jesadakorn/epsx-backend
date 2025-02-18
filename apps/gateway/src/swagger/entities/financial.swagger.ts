import { ApiProperty } from '@nestjs/swagger';

/**
 * Financial Service Swagger Entities
 * This file is the source of truth for Financial service DTOs used in the API Gateway.
 * These DTOs define the contract between the API and clients.
 */

export class EpsGrowthDataDto {
  @ApiProperty({ description: 'Stock symbol' })
  symbol: string;

  @ApiProperty({ description: 'Company name' })
  company_name: string;

  @ApiProperty({ description: 'Market code' })
  market_code: string;

  @ApiProperty({ description: 'Earnings per share value' })
  eps: number;

  @ApiProperty({ description: 'EPS growth percentage' })
  eps_growth: number;

  @ApiProperty({ description: 'Rank position in the list' })
  rank: number;

  @ApiProperty({ description: 'Last report date' })
  last_report_date: string;
}

export class EpsGrowthMetadataDto {
  @ApiProperty({ description: 'Number of items to skip' })
  skip: number;

  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class EpsGrowthRankingResponseDto {
  @ApiProperty({ type: [EpsGrowthDataDto] })
  data: EpsGrowthDataDto[];

  @ApiProperty({ type: EpsGrowthMetadataDto })
  metadata: EpsGrowthMetadataDto;
}

export class FinancialFetchResponseDto {
  @ApiProperty({ description: 'Status message' })
  message: string;

  @ApiProperty({ description: 'Operation success status' })
  success: boolean;
}

export class HealthCheckResponseDto {
  @ApiProperty({ description: 'Service status', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'Service name', example: 'financial-service' })
  service: string;

  @ApiProperty({ description: 'Timestamp of health check', example: '2025-02-17T14:52:44.000Z' })
  timestamp: string;
}
