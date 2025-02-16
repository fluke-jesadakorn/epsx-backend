export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  skip: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  metadata: PaginationMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMeta;
}

/**
 * Format pagination response with metadata
 */
export function formatPaginationResponse<T>(
  data: T[],
  total: number,
  skip: number,
  limit: number,
  orderBy?: string,
  direction?: 'ASC' | 'DESC',
): PaginationResult<T> {
  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    metadata: {
      skip,
      total,
      page,
      limit,
      totalPages,
      orderBy,
      direction,
    },
  };
}

/**
 * Get pagination options from params
 */
export function getPaginationOptions(params: PaginationParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    orderBy: params.orderBy,
    direction: params.direction,
  };
}
