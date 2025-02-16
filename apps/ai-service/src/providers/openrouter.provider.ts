import { AIProvider, AIProviderConfig, AIQueryParams, AIResponse, ChatQueryParams, ChatResponse } from '@investing/common';
import { ChatOpenAI } from '@langchain/openai';

export class OpenRouterProvider implements AIProvider {
  private baseURL: string = 'https://openrouter.ai/api/v1';
  private defaultModel: string = 'deepseek/deepseek-r1:free';

  validateConfig(config: AIProviderConfig): boolean {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    return true;
  }

  createClient(config: AIProviderConfig) {
    return new ChatOpenAI({
      modelName: process.env.OPENROUTER_MODEL || this.defaultModel,
      temperature: 0.3,
      maxTokens: 1000,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: process.env.OPENROUTER_BASE_URL || this.baseURL,
        defaultHeaders: {
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.SITE_NAME || 'Local Development',
        },
      },
    });
  }

  async query(params: AIQueryParams): Promise<AIResponse> {
    const client = this.createClient({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL,
      model: params.model
    });
    const startTime = Date.now();
    
    try {
      const result = await client.invoke(params.prompt);
      const content = Array.isArray(result.content) 
        ? result.content.map(c => typeof c === 'string' ? c : JSON.stringify(c)).join(' ')
        : typeof result.content === 'string' 
          ? result.content 
          : JSON.stringify(result.content);
      
      return {
        text: content,
        usage: {
          prompt_tokens: Math.ceil(params.prompt.length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil((params.prompt.length + content.length) / 4)
        },
        model: params.model || this.defaultModel,
        created_at: new Date(startTime)
      };
    } catch (error) {
      throw new Error(`OpenRouter query failed: ${error.message}`);
    }
  }

  async chat(params: ChatQueryParams): Promise<ChatResponse> {
    const client = this.createClient({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL,
      model: params.model
    });
    const startTime = Date.now();
    
    try {
      const messages = params.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const result = await client.invoke(messages);
      const content = Array.isArray(result.content) 
        ? result.content.map(c => typeof c === 'string' ? c : JSON.stringify(c)).join(' ')
        : typeof result.content === 'string' 
          ? result.content 
          : JSON.stringify(result.content);
      
      return {
        message: {
          role: 'assistant',
          content: content
        },
        usage: {
          prompt_tokens: Math.ceil(JSON.stringify(messages).length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil((JSON.stringify(messages).length + content.length) / 4)
        },
        model: params.model || this.defaultModel,
        created_at: new Date(startTime)
      };
    } catch (error) {
      throw new Error(`OpenRouter chat failed: ${error.message}`);
    }
  }
}
