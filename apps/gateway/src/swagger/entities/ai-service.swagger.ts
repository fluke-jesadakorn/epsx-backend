import { ApiProperty } from '@nestjs/swagger';

export class Usage {
  @ApiProperty({ type: Number, example: 150 })
  prompt_tokens: number;

  @ApiProperty({ type: Number, example: 50 })
  completion_tokens: number;

  @ApiProperty({ type: Number, example: 200 })
  total_tokens: number;
}

export class ChatMessage {
  @ApiProperty({ 
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    type: String,
    example: 'What is the current market trend for tech stocks?'
  })
  content: string;
}

export class AIQueryRequestExample {
  @ApiProperty({
    type: String,
    example: 'gpt-4'
  })
  model: string;

  @ApiProperty({
    type: String,
    example: 'Analyze the recent performance of AAPL stock'
  })
  prompt: string;

  @ApiProperty({
    type: Object,
    example: {
      symbol: 'AAPL',
      timeframe: '1M',
      indicators: ['MA', 'RSI']
    },
    required: false
  })
  market_context?: any;

  @ApiProperty({
    type: Number,
    example: 1000,
    required: false
  })
  max_tokens?: number;

  @ApiProperty({
    type: Number,
    example: 0.7,
    required: false
  })
  temperature?: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
    required: false
  })
  top_p?: number;
}

export class AIQueryResponseExample {
  @ApiProperty({
    type: String,
    example: 'Based on the analysis of AAPL stock performance...'
  })
  text: string;

  @ApiProperty({ type: () => Usage })
  usage: Usage;

  @ApiProperty({
    type: String,
    example: 'gpt-4'
  })
  model: string;
}

export class ChatQueryRequestExample {
  @ApiProperty({
    type: String,
    example: 'gpt-4'
  })
  model: string;

  @ApiProperty({
    type: [ChatMessage],
    example: [
      {
        role: 'system',
        content: 'You are a financial analysis assistant.'
      },
      {
        role: 'user',
        content: 'How has the tech sector performed this quarter?'
      }
    ]
  })
  messages: ChatMessage[];

  @ApiProperty({
    type: Object,
    example: {
      sector: 'Technology',
      period: 'Q4 2024'
    },
    required: false
  })
  market_context?: any;

  @ApiProperty({
    type: Number,
    example: 1000,
    required: false
  })
  max_tokens?: number;

  @ApiProperty({
    type: Number,
    example: 0.7,
    required: false
  })
  temperature?: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
    required: false
  })
  top_p?: number;
}

export class ChatResponseExample {
  @ApiProperty({ type: () => ChatMessage })
  message: ChatMessage;

  @ApiProperty({ type: () => Usage })
  usage: Usage;

  @ApiProperty({
    type: String,
    example: 'gpt-4'
  })
  model: string;
}

// Future Features Documentation
/**
 * TODO: Add documentation for future features:
 * - Streaming response types
 * - Voice query request/response types
 * - Technical analysis integration types
 * - Custom model configuration types
 * - Sentiment analysis response types
 * - Market signals response types
 * - Real-time data integration types
 */
