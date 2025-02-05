import { Module } from '@nestjs/common';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { AiQueryService } from './ai-query.service';

@Module({
  controllers: [AiServiceController],
  providers: [AiServiceService, AiQueryService],
  exports: [AiServiceService, AiQueryService],
})
// TODO: Consider adding configuration options for different AI providers
// to make the service more flexible for future integrations
export class AiServiceModule {}
