import { ApiProperty } from '@nestjs/swagger';

// Swagger Response Classes
export class SwaggerPaginatedResponse {
  @ApiProperty({ type: Number, example: 100 })
  total: number;

  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  limit: number;

  @ApiProperty({ type: Number, example: 10 })
  totalPages: number;

  @ApiProperty({ type: Boolean, example: true })
  hasNextPage: boolean;

  @ApiProperty({ type: Boolean, example: false })
  hasPrevPage: boolean;
}

export class SwaggerErrorResponse {
  @ApiProperty({ type: Number, example: 400 })
  statusCode: number;

  @ApiProperty({ type: String, example: 'Bad Request' })
  error: string;

  @ApiProperty({ type: String, example: 'Validation failed' })
  message: string;
}

export class SwaggerHealthCheckResponse {
  @ApiProperty({ type: String, example: 'ok' })
  status: string;

  @ApiProperty({ type: String, example: 'financial-service' })
  service: string;

  @ApiProperty({ type: String, example: '2024-02-15T04:11:16.789Z' })
  timestamp: string;
}

/**
 * TODO: Future improvements
 * 1. Add more common Swagger response types
 * 2. Add request body validation decorators
 * 3. Add security scheme decorators
 * 4. Add custom response serializers
 * 5. Add API version support
 */
