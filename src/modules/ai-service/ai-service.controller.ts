import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiServiceService } from './ai-service.service';
import { AiQueryDto } from './dto/ai-query.dto';
import { ChatQueryDto } from './dto/chat-query.dto';
import { AiQueryResponse } from './types/index';
import { AIMessage } from './schema/ai-provider.schema';
import { 
  AiQueryRequestExample, 
  AiChatRequestExample,
  ApiQueryFeatures,
  AiQueryResponseSchema,
  AiChatResponseSchema,
  ErrorResponseSchema 
} from '../../../docs/swagger/entities/ai-service.swagger';

/**
 * Controller for AI-powered natural language processing of financial data
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
@Controller('ai-service')
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  @MessagePattern('ai.query')
  @ApiOperation({
    summary: 'Execute a natural language query with AI analysis',
    description: ApiQueryFeatures,
  })
  @ApiBody({ type: AiQueryDto, examples: AiQueryRequestExample.examples })
  @ApiResponse({ status: 200, description: 'Query processed successfully', schema: AiQueryResponseSchema })
  @ApiResponse({ status: 400, description: 'Bad request - Query processing failed', schema: ErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: ErrorResponseSchema })
  async processQuery(@Payload() queryDto: AiQueryDto): Promise<AiQueryResponse> {
    return this.aiServiceService.processQuery(queryDto);
  }

  @MessagePattern('ai.chat')
  @ApiOperation({
    summary: 'Process chat messages with AI',
    description: 'Handle conversational interactions with the AI model',
  })
  @ApiBody({ type: ChatQueryDto, examples: AiChatRequestExample.examples })
  @ApiResponse({ status: 200, description: 'Chat message processed successfully', schema: AiChatResponseSchema })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid message format', schema: ErrorResponseSchema })
  async chat(@Payload() chatDto: ChatQueryDto): Promise<AIMessage> {
    return this.aiServiceService.handleChat(chatDto);
  }
}
