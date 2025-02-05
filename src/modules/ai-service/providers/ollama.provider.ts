import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AIProvider, AIProviderConfig } from '../schema/ai-provider.schema';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly logger = new Logger(OllamaProvider.name);

  createClient(config: AIProviderConfig): OpenAI {
    this.logger.debug('Creating Ollama client');
    return new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 2,
    });
  }

  validateConfig(config: AIProviderConfig): void {
    if (!config.baseURL) {
      throw new Error('Base URL is required for Ollama provider');
    }
    if (!config.model) {
      throw new Error('Model configuration is required for Ollama provider');
    }
    this.logger.debug('Ollama configuration validated');
  }
}
