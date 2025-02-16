import { PaginationParams, PaginationResult, formatPaginationResponse } from '../pagination.util';

/**
 * Decorator to automatically handle pagination in controller methods
 * @returns MethodDecorator
 */
export function Paginate() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // If result is already in pagination format, return as is
      if (result?.metadata?.totalPages) {
        return result;
      }

      // Get pagination params from args
      const params: PaginationParams = args[0] || {};
      const page = params.page || 1;
      const limit = params.limit || 20;
      const skip = (page - 1) * limit;

      // Format response with pagination metadata
      return formatPaginationResponse(
        result.data || result,
        result.total || result.length,
        skip,
        limit,
        params.orderBy,
        params.direction,
      );
    };

    return descriptor;
  };
}

// TODO: Future enhancements
// - Add cursor-based pagination support
// - Add sorting validation
// - Add field selection/projection
// - Add response caching
// - Add response compression
