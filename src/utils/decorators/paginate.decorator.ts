import {
  PaginatedResponse,
  PaginationParams,
  PaginationMetadata,
  PaginationResult,
  EnhancedPaginationMetadata,
} from '../../types/common.types';

/**
 * Creates enhanced metadata for pagination response
 */
function createEnhancedPaginationMetadata(
  params: PaginationParams,
  total: number,
  resultParams: Partial<PaginationParams> = {},
): EnhancedPaginationMetadata {
  const limit = resultParams.limit || params.limit || 20;

  // Handle both skip and page-based pagination
  let skip: number;
  if (typeof params.skip === 'number') {
    skip = params.skip;
  } else {
    const page = params.page || 1;
    skip = (page - 1) * limit;
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const hasNextPage = skip + limit < total;
  const hasPreviousPage = skip > 0;
  const nextSkip = hasNextPage ? skip + limit : null;
  const previousSkip = hasPreviousPage ? Math.max(0, skip - limit) : null;

  return {
    total,
    limit,
    skip,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextSkip,
    previousSkip,
    orderBy: resultParams.orderBy || params.orderBy,
    direction: resultParams.direction || params.direction,
  };
}

/**
 * Creates a paginated response with metadata
 */
function transformToPaginatedResponse<T>(
  result: PaginationResult<T>,
  params: PaginationParams,
): PaginatedResponse<T> {
  // For backward compatibility, transform new format to old format
  const enhancedMetadata = createEnhancedPaginationMetadata(
    params,
    result.pagination.total,
  );

  return {
    data: result.data,
    metadata: {
      skip: enhancedMetadata.skip,
      total: enhancedMetadata.total,
      page: enhancedMetadata.currentPage,
      limit: enhancedMetadata.limit,
      totalPages: enhancedMetadata.totalPages,
      orderBy: enhancedMetadata.orderBy,
      direction: enhancedMetadata.direction,
    },
  };
}

/**
 * Type guard to check if a result is a PaginationResult
 */
function isPaginationResult(result: any): result is PaginationResult<any> {
  return (
    result &&
    typeof result === 'object' &&
    'data' in result &&
    'pagination' in result
  );
}

/**
 * Extract PaginationParams from method arguments
 */
function extractPaginationParams(args: any[]): PaginationParams {
  // Look for PaginationParams in the arguments
  const params = args.find(
    (arg) =>
      arg &&
      typeof arg === 'object' &&
      ('page' in arg ||
        'limit' in arg ||
        'orderBy' in arg ||
        'direction' in arg),
  ) as PaginationParams | undefined;

  return params || {};
}

/**
 * Decorator for paginating method responses
 */
export function Paginate() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) throw new Error('Method is undefined');

    descriptor.value = async function (
      this: any,
      ...args: any[]
    ): Promise<PaginatedResponse<any>> {
      // Extract pagination params from arguments
      const paginationParams = extractPaginationParams(args);

      const result = await originalMethod.apply(this, args);

      if (isPaginationResult(result)) {
        return transformToPaginatedResponse(result, paginationParams);
      }

      // Handle arrays
      // Handle arrays
      if (Array.isArray(result)) {
        const total = result.length;
        return transformToPaginatedResponse(
          {
            data: result,
            pagination: createEnhancedPaginationMetadata(
              paginationParams,
              total,
            ),
          },
          paginationParams,
        );
      }

      // Handle single object
      if (result && typeof result === 'object') {
        return transformToPaginatedResponse(
          {
            data: [result],
            pagination: createEnhancedPaginationMetadata(paginationParams, 1),
          },
          paginationParams,
        );
      }

      // Handle empty or invalid results
      return transformToPaginatedResponse(
        {
          data: [],
          pagination: createEnhancedPaginationMetadata(paginationParams, 0),
        },
        paginationParams,
      );
    };

    return descriptor;
  };
}

/**
 * TODO: Future Improvements:
 * - Add cursor-based pagination
 * - Add response caching
 * - Support nested field sorting
 * - Add field selection/projection
 * - Add custom metadata fields support
 * - Add dynamic page size limits
 * - Add query parameter validation
 */
