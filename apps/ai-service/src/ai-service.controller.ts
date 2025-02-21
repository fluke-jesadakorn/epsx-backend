import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AiServiceService } from './ai-service.service';
import { AiQueryDto } from './dto/ai-query.dto';
import { ChatQueryDto } from './dto/chat-query.dto';
import { AiQueryResponse } from './types/ai.types';
import { AIMessage } from '@app/common/schemas/ai-provider.schema';

@Controller()
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  @MessagePattern('ai.query')
  async processQuery(
    @Payload() queryDto: AiQueryDto,
  ): Promise<AiQueryResponse> {
    return this.aiServiceService.processQuery(queryDto);
  }

  @MessagePattern('ai.chat')
  async chat(@Payload() chatDto: ChatQueryDto): Promise<AIMessage> {
    return this.aiServiceService.handleChat(chatDto);
  }
}
