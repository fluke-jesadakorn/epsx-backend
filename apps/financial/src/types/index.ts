export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginationMetadata {
  total: number;
  skip: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export * from './financial.types';
