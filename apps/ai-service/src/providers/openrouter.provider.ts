import {
  AIProvider,
  AIProviderConfig,
  AIQueryParams,
  AIResponse,
  ChatQueryParams,
  ChatResponse,
  ProviderType,
  AIMessage,
  AIRequestOptions,
} from '../types/interfaces';
import { ChatOpenAI } from '@langchain/openai';
import { Logger } from '@nestjs/common';

export class OpenRouterProvider implements AIProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultModel: string = 'deepseek/deepseek-r1:free';

  validateConfig(config: AIProviderConfig): boolean {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    return true;
  }

  createClient(config: AIProviderConfig) {
    return new ChatOpenAI({
      modelName: config.model || this.defaultModel,
      temperature: 0.7,
      maxTokens: 1000,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl || this.baseUrl,
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'EPSX Backend',
        },
        defaultQuery: {
          route: 'openai',
        },
      },
    });
  }

  async generateResponse(
    messages: AIMessage[],
    options?: AIRequestOptions,
  ): Promise<AIMessage> {
    const config = options?.config || {
      apiKey: '',
      model: this.defaultModel,
      type: ProviderType.OPENROUTER,
    };
    const client = this.createClient(config);
    try {
      const formattedMessages = Array.from(messages).map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      this.logger.debug('Formatted messages:', formattedMessages);
      const result = await client.invoke(formattedMessages);
      const content =
        typeof result.content === 'string'
          ? result.content
          : JSON.stringify(result.content);
      return {
        role: 'assistant',
        content,
      };
    } catch (error) {
      throw new Error(`OpenRouter generation failed: ${error.message}`);
    }
  }

  async query(params: AIQueryParams): Promise<AIResponse> {
    const config = params.options?.config || {
      apiKey: '',
      model: params.model || this.defaultModel,
      type: ProviderType.OPENROUTER,
    };
    const client = this.createClient(config);
    const startTime = Date.now();

    try {
      const formattedPrompt = [
        {
          type: 'user',
          role: 'user',
          content: params.prompt,
        },
      ];
      const result = await client.invoke(formattedPrompt);
      const content = Array.isArray(result.content)
        ? result.content
            .map((c) => (typeof c === 'string' ? c : JSON.stringify(c)))
            .join(' ')
        : typeof result.content === 'string'
          ? result.content
          : JSON.stringify(result.content);

      return {
        text: content,
        usage: {
          prompt_tokens: Math.ceil(params.prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil((params.prompt.length + content.length) / 4),
        },
        model: params.model || this.defaultModel,
        created_at: new Date(startTime),
      };
    } catch (error) {
      throw new Error(`OpenRouter query failed: ${error.message}`);
    }
  }

  async chat(params: ChatQueryParams): Promise<ChatResponse> {
    const config = params.options?.config || {
      apiKey: '',
      model: params.model || this.defaultModel,
      type: ProviderType.OPENROUTER,
    };
    const client = this.createClient(config);
    const startTime = Date.now();

    try {
      const formattedMessages = Array.from(params.messages).map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      this.logger.debug('Chat messages:', formattedMessages);
      const result = await client.invoke(formattedMessages);
      const content = Array.isArray(result.content)
        ? result.content
            .map((c) => (typeof c === 'string' ? c : JSON.stringify(c)))
            .join(' ')
        : typeof result.content === 'string'
          ? result.content
          : JSON.stringify(result.content);

      return {
        message: {
          role: 'assistant',
          content: content,
        },
        usage: {
          prompt_tokens: Math.ceil(JSON.stringify(formattedMessages).length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil(
            (JSON.stringify(formattedMessages).length + content.length) / 4,
          ),
        },
        model: params.model || this.defaultModel,
        created_at: new Date(startTime),
      };
    } catch (error) {
      this.logger.error('OpenRouter chat error:', error);
      throw new Error(`OpenRouter chat failed: ${error.message}`);
    }
  }
}
