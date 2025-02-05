/**
 * Central export point for all schema definitions
 */

export * from './sql-query.schema';
export * from './ai-provider.schema';
export * from './query-response.schema';

// DTO Validation Schemas

/**
 * Validation schema for text query input
 */
export const textQueryValidationSchema = {
  type: 'object',
  required: ['query'],
  properties: {
    query: {
      type: 'string',
      minLength: 1,
      maxLength: 1000,
      description: 'Natural language query to process'
    },
    format: {
      type: 'string',
      enum: ['json', 'html'],
      default: 'json',
      description: 'Response format type'
    },
    options: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          default: 10
        },
        cache: {
          type: 'boolean',
          default: true
        },
        timeout: {
          type: 'number',
          minimum: 1000,
          maximum: 30000,
          default: 5000
        }
      }
    }
  }
};

/**
 * Common validation patterns used across schemas
 */
export const validationPatterns = {
  sqlIdentifier: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  metricName: /^[a-zA-Z_][a-zA-Z0-9_]*(%)?$/,
  version: /^\d+\.\d+\.\d+$/
};

/**
 * Schema version and compatibility information
 */
export const schemaVersion = {
  version: '1.0.0',
  compatibleWith: '>=1.0.0',
  lastUpdated: '2025-02-04',
  features: [
    'SQL query generation',
    'AI provider configuration',
    'Response formatting',
    'Data transformation',
    'HTML presentation'
  ]
};

// Future schema additions:
// TODO: Add validation schema for streaming responses
// TODO: Add validation schema for batch queries
// TODO: Add validation schema for advanced analytics options
// TODO: Add validation schema for custom templates
// TODO: Add validation schema for export options
