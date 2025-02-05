/**
 * Type definitions for AI service module
 */

export interface AiQueryResponse {
  success: boolean;
  data: any[];
  analysis: string;
  meta: {
    executionTime: number;
    timestamp: string;
  };
}

/**
 * Future enhancements:
 * TODO: Add types for export formats (CSV, Excel)
 * TODO: Add types for advanced visualization options
 * TODO: Add types for custom query templates
 */
