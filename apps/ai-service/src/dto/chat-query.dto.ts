import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AIMessage, AIRequestOptions } from '../types/ai.types';

export class MessageDto implements AIMessage {
  @ApiProperty({
    enum: ['system', 'user', 'assistant'],
    description: 'Role of the message sender',
    example: 'user',
  })
  @IsEnum(['system', 'user', 'assistant'], {
    message: 'Invalid role specified',
  })
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'What is the latest financial data for Apple?',
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  content: string;
}

export class ChatQueryDto {
  @ApiProperty({
    type: [MessageDto],
    description: 'Array of chat messages',
    example: [
      {
        role: 'user',
        content: 'What is the latest financial data for Apple?',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: AIMessage[];

  @ApiProperty({
    required: false,
    description: 'Optional AI request options (temperature, maxTokens)',
    example: {
      temperature: 0.7,
      maxTokens: 500,
    },
  })
  @IsOptional()
  options?: AIRequestOptions;
}
