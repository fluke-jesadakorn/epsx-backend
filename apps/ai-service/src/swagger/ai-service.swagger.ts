import { ApiProperty } from '@nestjs/swagger';

// TODO: Future features to consider:
// 1. Add support for SQL query validation before execution
// 2. Implement caching for frequently asked queries
// 3. Add support for custom response templates
// 4. Implement rate limiting per user/client
// 5. Add support for batch queries

export class AiQueryRequestExample {
  static readonly examples = {
    basicQuery: {
      summary: 'Basic Query',
      description: 'Simple query without options',
      value: {
        query: 'Show me tech companies with revenue over 1 million dollars',
      },
    },
    queryWithOptions: {
      summary: 'Query with Options',
      description: 'Query with custom limit option',
      value: {
        query: 'What are the top performing companies by EPS growth?',
        options: {
          limit: 5,
        },
      },
    },
    complexQuery: {
      summary: 'Complex Query',
      description: 'Detailed analysis query with custom options',
      value: {
        query:
          'Compare revenue growth of top tech companies over the last 3 years',
        options: {
          limit: 10,
        },
      },
    },
  };

  @ApiProperty({
    description: 'The query to process',
    example: 'Show me tech companies with revenue over 1 million dollars',
  })
  query: string;

  @ApiProperty({
    description: 'Query processing options',
    required: false,
    type: () => ({
      limit: {
        type: 'number',
        description: 'Maximum number of results to return',
        minimum: 1,
        maximum: 100,
        default: 10,
      },
    }),
  })
  options?: {
    limit?: number;
  };
}

export class ChatMessage {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['system', 'user', 'assistant'],
    example: 'user',
  })
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'What are the latest financial metrics for Apple?',
  })
  content: string;
}

export class ChatOptions {
  @ApiProperty({
    description: 'Temperature for response generation (0.0 to 1.0)',
    minimum: 0,
    maximum: 1,
    default: 0.7,
    required: false,
  })
  temperature?: number;

  @ApiProperty({
    description: 'Maximum number of tokens in the response',
    minimum: 1,
    maximum: 2048,
    default: 500,
    required: false,
  })
  maxTokens?: number;
}

export class AiChatRequestExample {
  static readonly examples = {
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
          maxTokens: 1000,
        },
      },
    },
    advancedChat: {
      summary: 'Advanced Chat Query',
      description: 'Chat with custom response parameters',
      value: {
        messages: [
          {
            role: 'system',
            content: 'Provide detailed financial analysis with market context.',
          },
          {
            role: 'user',
            content: 'Analyze the competitive landscape of the EV market',
          },
        ],
        options: {
          temperature: 0.9,
          maxTokens: 2048,
        },
      },
    },
  };

  @ApiProperty({
    description: 'Array of chat messages',
    type: [ChatMessage],
    examples: AiChatRequestExample.examples,
  })
  messages: ChatMessage[];

  @ApiProperty({
    description: 'Chat configuration options',
    type: ChatOptions,
    required: false,
  })
  options?: ChatOptions;
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
