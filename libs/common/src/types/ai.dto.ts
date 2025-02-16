import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AIQueryParams, ChatQueryParams, ChatMessage, AIResponse, ChatResponse } from './ai.types';

export class AIQueryDto implements AIQueryParams {
  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  market_context?: any;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  max_tokens?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  top_p?: number;
}

export class ChatMessageDto implements ChatMessage {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatQueryDto implements ChatQueryParams {
  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty({ type: [ChatMessageDto] })
  messages: ChatMessage[];

  @ApiProperty({ required: false })
  @IsOptional()
  market_context?: any;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  max_tokens?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  top_p?: number;
}

export class AIResponseDto implements Omit<AIResponse, 'created_at'> {
  @ApiProperty()
  text: string;

  @ApiProperty()
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };

  @ApiProperty()
  model: string;
}

export class ChatResponseDto implements Omit<ChatResponse, 'created_at'> {
  @ApiProperty({ type: ChatMessageDto })
  message: ChatMessage;

  @ApiProperty()
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };

  @ApiProperty()
  model: string;
}
