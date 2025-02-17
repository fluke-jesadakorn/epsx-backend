import { PaginationMetadata, PaginationResult } from '@financial/types';

export function formatPaginationResponse<T>(
  data: T[],
  total: number,
  skip: number,
  limit: number,
): PaginationResult<T> {
  const metadata: PaginationMetadata = {
    total,
    skip,
    limit,
    hasMore: skip + limit < total,
  };

  return {
    data,
    metadata,
  };
}
