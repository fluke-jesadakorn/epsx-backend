import { PaginationParams } from '../types/common.types';

/**
 * Get pagination options for Mongoose queries
 */
export const getPaginationOptions = (params: PaginationParams = {}) => {
  const limit = params.limit || 20;
  const page = params.page || 1;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    sort: params.orderBy
      ? {
          [params.orderBy]: params.direction === 'DESC' ? -1 : 1,
        }
      : undefined,
  };
};

/**
 * Convert skip/limit pagination to page/limit format
 * @param skip Number of items to skip
 * @param limit Number of items per page
 * @returns Page number and limit
 */
export const skipToPage = (skip: number = 0, limit: number = 20) => {
  const page = Math.floor(skip / limit) + 1;
  return { page, limit };
};

/**
 * Convert page/limit pagination to skip/limit format
 * @param page Page number
 * @param limit Number of items per page
 * @returns Skip count and limit
 */
export const pageToSkip = (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

/**
 * Format pagination response for frontend
 * @param data Array of items
 * @param total Total number of items
 * @param skip Number of items skipped
 * @param limit Number of items per page
 * @returns Formatted pagination response
 */
export const formatPaginationResponse = <T>(
  data: T[],
  total: number,
  skip: number = 0,
  limit: number = 20,
) => {
  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Calculate current page from skip/limit
  const currentPage = Math.floor(skip / limit) + 1;

  // Calculate if there are more pages
  const hasNextPage = skip + limit < total;
  const hasPreviousPage = skip > 0;

  // Calculate next and previous skip values
  const nextSkip = hasNextPage ? skip + limit : null;
  const previousSkip = hasPreviousPage ? Math.max(0, skip - limit) : null;

  return {
    data,
    pagination: {
      total,
      limit,
      skip,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextSkip,
      previousSkip,
    },
  };
};
