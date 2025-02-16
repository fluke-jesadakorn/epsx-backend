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
