import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrevious: boolean;
}

/**
 * @todo Future Features:
 * - Sorting metadata
 * - Filtering metadata
 * - Response metadata
 * - Cache information
 * - Rate limiting metadata
 */
