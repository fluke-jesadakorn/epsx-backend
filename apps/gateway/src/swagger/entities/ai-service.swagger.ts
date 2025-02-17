import { ApiProperty } from '@nestjs/swagger';
import {
  AIQueryParams,
  ChatQueryParams,
  AIResponse,
  ChatResponse,
} from '../../types/ai.types';

export class AIQueryDto implements AIQueryParams {
  @ApiProperty({
    description: 'AI model to use for processing',
    example: 'gpt-3.5-turbo',
  })
  model: string;

  @ApiProperty({
    description: 'The query prompt',
    example: 'What are the current market trends?',
  })
  prompt: string;

  @ApiProperty({ description: 'Optional market context data', required: false })
  market_context?: any;

  @ApiProperty({
    description: 'Maximum tokens to generate',
    required: false,
    example: 1000,
  })
  max_tokens?: number;

  @ApiProperty({
    description: 'Temperature for response randomness',
    required: false,
    example: 0.7,
  })
  temperature?: number;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Role of the message sender', example: 'user' })
  role: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'How is the market performing today?',
  })
  content: string;
}

export class ChatQueryDto implements ChatQueryParams {
  @ApiProperty({
    description: 'AI model to use for chat',
    example: 'gpt-3.5-turbo',
  })
  model: string;

  @ApiProperty({
    description: 'Array of chat messages',
    type: [ChatMessageDto],
  })
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;

  @ApiProperty({ description: 'Optional market context data', required: false })
  market_context?: any;

  @ApiProperty({
    description: 'Maximum tokens to generate',
    required: false,
    example: 1000,
  })
  max_tokens?: number;

  @ApiProperty({
    description: 'Temperature for response randomness',
    required: false,
    example: 0.7,
  })
  temperature?: number;
}

export class TokenUsageDto {
  @ApiProperty({ description: 'Number of tokens in the prompt' })
  prompt_tokens: number;

  @ApiProperty({ description: 'Number of tokens in the completion' })
  completion_tokens: number;

  @ApiProperty({ description: 'Total number of tokens used' })
  total_tokens: number;
}

export class AIResponseDto implements AIResponse {
  @ApiProperty({ description: 'Generated response text' })
  text: string;

  @ApiProperty({ type: TokenUsageDto })
  usage: TokenUsageDto;

  @ApiProperty({ description: 'Model used for generation' })
  model: string;

  @ApiProperty({ description: 'Response creation timestamp' })
  created_at: Date;
}

export class ChatMessageResponseDto {
  @ApiProperty({
    description: 'Role of the message sender',
    example: 'assistant',
  })
  role: "system" | "user" | "assistant";

  @ApiProperty({ description: 'Content of the message' })
  content: string;
}

export class ChatResponseDto implements ChatResponse {
  @ApiProperty({ type: ChatMessageResponseDto })
  message: ChatMessageResponseDto;

  @ApiProperty({ type: TokenUsageDto })
  usage: TokenUsageDto;

  @ApiProperty({ description: 'Model used for chat' })
  model: string;

  @ApiProperty({ description: 'Response creation timestamp' })
  created_at: Date;
}
