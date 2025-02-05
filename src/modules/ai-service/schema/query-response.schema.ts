/**
 * Schema definitions for query responses
 */

// Raw database query result
export interface RawQueryResultSchema {
  columns: string[];
  rows: any[][];
  rowCount: number;
  command: string;
}

// Base query response structure
export interface BaseQueryResponseSchema {
  success: boolean;
  timestamp: string;
  executionTime: number;
}

/**
 * Complete query response schema
 */
export interface CompleteQueryResponseSchema extends BaseQueryResponseSchema {
  data: any[];
  analysis: string;
  meta: {
    query?: string;
    params?: any[];
  };
}

/**
 * TODO: Future Enhancements
 * - Add schema for response caching
 * - Add schema for export formats (CSV, Excel)
 * - Add schema for custom query templates
 */
