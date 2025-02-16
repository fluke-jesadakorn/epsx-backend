// Utility Types
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
  initialDelay?: number;
  maxDelay?: number;
  retryableErrors?: (string | RegExp)[]; // Array of error types/messages/patterns that should trigger retry
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Pagination Types
export interface PaginationParams {
  limit?: number;
  page?: number;
  skip?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface EnhancedPaginationMetadata {
  total: number;
  limit: number;
  skip: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextSkip: number | null;
  previousSkip: number | null;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: EnhancedPaginationMetadata;
}

// Legacy pagination interfaces for backward compatibility
export interface PaginationMetadata {
  skip: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[] | Record<string, any>;
  metadata: PaginationMetadata;
}

/**
 * TODO: Future pagination improvements
 * 1. Add cursor-based pagination support
 * 2. Implement keyset pagination for better performance
 * 3. Add support for custom pagination strategies
 * 4. Add validation for pagination parameters
 * 5. Implement caching for pagination results
 */

// Generic Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// TODO: Add more common types like:
// - Authentication/Authorization types
// - Generic HTTP client types
// - Common utility function types
// - Shared enum types
