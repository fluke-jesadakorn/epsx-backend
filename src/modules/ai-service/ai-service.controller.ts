import { Controller, Post, Body } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiQueryDto } from './dto/ai-query.dto';
import { AiQueryResponse } from './types/index';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Natural Language Queries')
@Controller('ai-service')
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  /**
   * Process natural language query and get AI-powered analysis of data
   * The response includes:
   * - Raw and formatted JSON data
   * - HTML/CSS presentation
   * - Natural language analysis and insights
   *
   * @example
   * // Example 1: Query about company revenues
   * {
   *   "query": "Show me tech companies with revenue over 1 million dollars"
   * }
   *
   * // Example 2: Query about financial trends
   * {
   *   "query": "What is the average revenue by fiscal year?"
   * }
   *
   * // Example 3: Query about specific companies
   * {
   *   "query": "Show me the latest financial data for Apple and Google"
   * }
   */
  @Post()
  @ApiOperation({
    summary: 'Execute a natural language query with AI analysis',
    description: `
Process natural language queries about financial data and get AI-powered analysis of results.
Queries can be about companies, financials, or market data.

Available Data:
- Company information (name, symbol, sector)
- Financial metrics (revenue, net income)
- Market data (exchange listings)
- Historical financial records (by fiscal year)

Features:
- Natural language query processing using AI
- Automatic SQL query generation
- AI-powered data analysis and insights
- Results in both JSON and HTML formats
- Trend identification and pattern analysis
- Historical data comparison
- Key metrics highlighting
- Cross-company analysis

Query Examples:
- "Show me tech companies with revenue over $1M in 2024"
- "Compare Apple and Microsoft's revenue growth over the last 3 years"
- "What are the top 5 companies by net income in the healthcare sector?"
- "Show revenue trends for companies listed on NYSE"
    `,
  })
  @ApiBody({
    type: AiQueryDto,
    examples: {
      jsonFormatQuery: {
        summary: 'JSON Format Query',
        description: 'Query with JSON response format',
        value: {
          query: 'Show me tech companies with revenue over 1 million dollars',
          format: 'json'
        },
      },
      htmlFormatQuery: {
        summary: 'HTML Format Query',
        description: 'Query with HTML response format',
        value: {
          query: 'Show me tech companies with revenue over 1 million dollars',
          format: 'html'
        },
      },
      defaultFormatQuery: {
        summary: 'Default Format Query',
        description: 'Query without specified format (defaults to JSON)',
        value: {
          query: 'What are the top performing companies by EPS growth?'
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Query processed successfully',
    schema: {
      type: 'object',
      required: ['success', 'data', 'analysis'],
      properties: {
        success: {
          type: 'boolean',
          description: 'Indicates if the query was processed successfully',
          example: true,
        },
        data: {
          type: 'array',
          description: 'Query results',
          items: {
            type: 'object',
            additionalProperties: true,
          },
        },
        analysis: {
          type: 'string',
          description: 'AI-generated analysis of the data',
        },
        meta: {
          type: 'object',
          description: 'Query metadata',
          properties: {
            executionTime: { type: 'number' },
            timestamp: { type: 'string' }
          }
        }
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Query processing failed',
    schema: {
      type: 'object',
      required: ['statusCode', 'message', 'error'],
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example:
            'Failed to process query: Invalid query format or unsupported query type',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      required: ['statusCode', 'message', 'error'],
      properties: {
        statusCode: {
          type: 'number',
          example: 500,
        },
        message: {
          type: 'string',
          example: 'Failed to connect to database or AI service',
        },
        error: {
          type: 'string',
          example: 'Internal Server Error',
        },
      },
    },
  })
  async processQuery(
    @Body() queryDto: AiQueryDto,
  ): Promise<AiQueryResponse> {
    return this.aiServiceService.processQuery(queryDto);
  }
}
