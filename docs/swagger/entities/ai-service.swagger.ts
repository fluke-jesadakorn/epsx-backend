import { ApiProperty } from '@nestjs/swagger';

export class AiQueryRequestExample {
  @ApiProperty({
    examples: {
      jsonFormatQuery: {
        summary: 'JSON Format Query',
        description: 'Query with JSON response format',
        value: {
          query: 'Show me tech companies with revenue over 1 million dollars',
          format: 'json',
        },
      },
      htmlFormatQuery: {
        summary: 'HTML Format Query',
        description: 'Query with HTML response format',
        value: {
          query: 'Show me tech companies with revenue over 1 million dollars',
          format: 'html',
        },
      },
      defaultFormatQuery: {
        summary: 'Default Format Query',
        description: 'Query without specified format (defaults to JSON)',
        value: {
          query: 'What are the top performing companies by EPS growth?',
        },
      },
    },
  })
  static examples = {};
}

export class AiChatRequestExample {
  @ApiProperty({
    examples: {
      basicChat: {
        summary: 'Basic Chat Query',
        description: 'Simple chat interaction',
        value: {
          messages: [
            {
              role: 'user',
              content: 'What are the latest financial metrics for Apple?',
            },
          ],
        },
      },
      conversationChat: {
        summary: 'Conversation Chat Query',
        description: 'Multi-turn conversation with context',
        value: {
          messages: [
            {
              role: 'system',
              content: 'Focus on financial analysis and market trends.',
            },
            {
              role: 'user',
              content: 'Compare the revenue growth of Apple and Microsoft',
            },
          ],
          options: {
            temperature: 0.7,
          },
        },
      },
    },
  })
  static examples = {};
}

export const ApiQueryFeatures = `
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
`;

export const AiQueryResponseSchema = {
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
        timestamp: { type: 'string' },
      },
    },
  },
};

export const AiChatResponseSchema = {
  type: 'object',
  required: ['role', 'content'],
  properties: {
    role: {
      type: 'string',
      enum: ['assistant'],
      example: 'assistant',
    },
    content: {
      type: 'string',
      description: 'AI-generated response',
      example: 'Based on the latest financial data, Apple reported...',
    },
  },
};

export const ErrorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 400 },
    message: { type: 'string', example: 'Invalid message format' },
    error: { type: 'string', example: 'Bad Request' },
  },
};
