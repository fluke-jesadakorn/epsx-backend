import { ApiProperty } from '@nestjs/swagger';

/**
 * Financial Service Swagger Entities
 * This file is the source of truth for Financial service DTOs used in the API Gateway.
 * These DTOs define the contract between the API and clients.
 */

export class EPSStockInfoDto {
  @ApiProperty({ description: 'Stock symbol' })
  symbol: string;

  @ApiProperty({ description: 'Company name', nullable: true })
  companyName: string | null;

  @ApiProperty({ description: 'Earnings per share value' })
  eps: number;

  @ApiProperty({ description: 'EPS growth percentage' })
  epsGrowthPercent: number;

  @ApiProperty({ description: 'Report date' })
  reportDate: string;
}

export class EPSGrowthResultDto {
  @ApiProperty({ type: EPSStockInfoDto })
  current: EPSStockInfoDto;

  @ApiProperty({ type: EPSStockInfoDto })
  previous: EPSStockInfoDto;
}

export class EPSGrowthMetadataDto {
  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Number of items to skip' })
  skip: number;
}

export class EPSGrowthResponseDto {
  @ApiProperty({ type: [EPSGrowthResultDto] })
  data: EPSGrowthResultDto[];

  @ApiProperty({ type: EPSGrowthMetadataDto })
  metadata: EPSGrowthMetadataDto;
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
