import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AIProvider, AIProviderConfig } from '../schema/ai-provider.schema';

@Injectable()
export class OpenRouterProvider implements AIProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);

  createClient(config: AIProviderConfig): OpenAI {
    this.logger.debug('Creating OpenRouter client');
    return new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      defaultHeaders: config.headers,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
    });
  }

  validateConfig(config: AIProviderConfig): void {
    if (!config.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required for OpenRouter provider');
    }
    if (!config.model) {
      throw new Error('Model configuration is required for OpenRouter provider');
    }
    this.logger.debug('OpenRouter configuration validated');
  }
}
