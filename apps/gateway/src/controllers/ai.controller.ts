import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  AIQueryDto,
  ChatQueryDto,
  AIResponseDto,
  ChatResponseDto,
} from '../swagger/entities/ai-service.swagger';

/**
 * Gateway controller for AI-powered natural language processing of financial data
 *
 * Future Features:
 * TODO: Add support for real-time market data analysis
 * TODO: Implement sentiment analysis for news and social media
 * TODO: Add support for custom AI models and fine-tuning
 * TODO: Integrate with more data providers
 * TODO: Add support for technical analysis and chart pattern recognition
 * TODO: Implement streaming responses for large data sets
 * TODO: Add support for voice queries
 * TODO: Implement automated trading signals based on AI analysis
 */
@ApiTags('Natural Language Queries')
@Controller('ai')
export class AiController {
  constructor(@Inject('AI_SERVICE') private readonly aiService: ClientProxy) {}

  @Post('query')
  @ApiOperation({
    summary: 'Execute a natural language query with AI analysis',
    description: 'Process natural language queries for financial data analysis',
  })
  @ApiBody({ type: AIQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Query processed successfully',
    type: AIResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Query processing failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
        details: { type: 'object' },
      },
    },
  })
  async processQuery(@Body() queryDto: AIQueryDto): Promise<AIResponseDto> {
    try {
      const response = await firstValueFrom(
        this.aiService.send({ cmd: 'ai.query' }, queryDto),
      );
      return response;
    } catch (error) {
      // Enhance error details for better debugging
      const errorDetails = {
        type: error?.name || 'UnknownError',
        message: error?.message || 'An unexpected error occurred',
        code: error?.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        originalError: error, // Keep original error for debugging
      };

      // Log the error for monitoring
      console.error('AI Query Error:', errorDetails);

      // Transform common errors into user-friendly messages
      if (errorDetails.code === 'ECONNREFUSED') {
        throw new Error(
          'AI service is temporarily unavailable. Please try again later.',
        );
      }

      if (errorDetails.type === 'TimeoutError') {
        throw new Error('Request timed out. Please try again.');
      }

      // Re-throw with meaningful message
      throw new Error(
        errorDetails.message !== 'undefined' 
          ? `Failed to process query: ${errorDetails.message}`
          : 'Failed to process query. Please try again later.'
      );
    }
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Process chat messages with AI',
    description: 'Handle conversational interactions with the AI model',
  })
  @ApiBody({ type: ChatQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Chat message processed successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid message format',
  })
  async chat(@Body() chatDto: ChatQueryDto): Promise<ChatResponseDto> {
    try {
      const response = await firstValueFrom(
        this.aiService.send({ cmd: 'ai.chat' }, chatDto),
      );
      return response;
    } catch (error) {
      // Enhance error details for better debugging
      const errorDetails = {
        type: error?.name || 'UnknownError',
        message: error?.message || 'An unexpected error occurred',
        code: error?.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        originalError: error, // Keep original error for debugging
      };

      // Log the error for monitoring
      console.error('AI Chat Error:', errorDetails);

      // Transform common errors into user-friendly messages
      if (errorDetails.code === 'ECONNREFUSED') {
        throw new Error(
          'AI chat service is temporarily unavailable. Please try again later.',
        );
      }

      if (errorDetails.type === 'TimeoutError') {
        throw new Error('Chat request timed out. Please try again.');
      }

      // Re-throw with meaningful message
      throw new Error(
        errorDetails.message !== 'undefined' 
          ? `Failed to process chat: ${errorDetails.message}`
          : 'Failed to process chat. Please try again later.'
      );
    }
  }

  // TODO: Add endpoints for:
  // - Batch processing of queries
  // - AI model selection
  // - Query history and analysis
  // - Custom model training endpoints
  // - Model performance metrics
  // - Network resilience features:
  //   - Circuit breaker for failing endpoints
  //   - Request retries with exponential backoff
  //   - Health check endpoints with detailed status
  //   - Client-side caching for frequent queries
  //   - Connection pooling for better performance
  //   - Request timeouts configuration
}
