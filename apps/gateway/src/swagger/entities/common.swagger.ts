import { ApiProperty } from '@nestjs/swagger';

export class PaginationParamsDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  limit?: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'List of items' })
  data: T[];
}

export class MemoryUsageDto {
  @ApiProperty({
    description: 'Resident Set Size in bytes',
    example: 100000000,
  })
  rss: number;

  @ApiProperty({ description: 'Total heap size in bytes', example: 50000000 })
  heapTotal: number;

  @ApiProperty({ description: 'Used heap size in bytes', example: 40000000 })
  heapUsed: number;
}

export class SwaggerHealthCheckResponse {
  @ApiProperty({ description: 'Service status', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'Uptime in seconds', example: 3600 })
  uptime: number;

  @ApiProperty({ type: MemoryUsageDto, description: 'Memory usage details' })
  memory: MemoryUsageDto;
}

export class SwaggerErrorResponse {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Bad Request' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'ValidationError' })
  error: string;
}
