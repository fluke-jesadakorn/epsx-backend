import { AIProvider, AIProviderConfig } from '../schema/ai-provider.schema';
import { ChatOpenAI } from '@langchain/openai';

export class OpenRouterProvider implements AIProvider {
  createClient(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    return new ChatOpenAI({
      modelName: config.model || 'deepseek/deepseek-r1:free',
      temperature: 0.3,
      maxTokens: 1000,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseURL || 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          ...(config.headers || {}),
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.SITE_NAME || 'Local Development',
        },
      },
    });
  }

  validateConfig(config: AIProviderConfig): void {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    if (!config.baseURL) {
      throw new Error('OpenRouter baseURL is required');
    }
  }
}
