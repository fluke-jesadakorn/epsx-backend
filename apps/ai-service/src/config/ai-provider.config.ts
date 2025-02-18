import { AIProviderConfig } from '@app/common/schemas/ai-provider.schema';
import { ConfigService } from '@nestjs/config';

export const AI_PROVIDER_CONFIG: Record<string, Partial<AIProviderConfig>> = {
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    model: 'mistral-small:latest',
    timeout: 30000,
    maxRetries: 2,
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free',
    timeout: 30000,
    maxRetries: 3,
  },
};

export const DEFAULT_AI_OPTIONS = {
  temperature: 0.3,
  maxTokens: 1000,
  responseFormat: { type: 'json_object' as const },
};
