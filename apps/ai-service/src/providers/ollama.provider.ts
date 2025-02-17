import {
  AIProvider,
  AIProviderConfig,
  AIQueryParams,
  AIResponse,
  ChatQueryParams,
  ChatResponse,
} from '@investing/common';
import { ChatOllama } from '@langchain/community/chat_models/ollama';

export class OllamaProvider implements AIProvider {
  private baseURL: string = 'http://localhost:11434';
  private defaultModel: string = 'mistral:latest';

  validateConfig(config: AIProviderConfig): boolean {
    // Ollama doesn't require API key validation
    return true;
  }

  createClient(config: AIProviderConfig) {
    const client = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || this.baseURL,
      model: process.env.OLLAMA_MODEL || this.defaultModel,
      temperature: 0.3,
    });
    return client;
  }

  async query(params: AIQueryParams): Promise<AIResponse> {
    const client = this.createClient({ model: params.model });
    const startTime = Date.now();

    try {
      const result = await client.invoke(params.prompt);
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
        model: this.defaultModel,
        created_at: new Date(startTime),
      };
    } catch (error) {
      throw new Error(`Ollama query failed: ${error.message}`);
    }
  }

  async chat(params: ChatQueryParams): Promise<ChatResponse> {
    const client = this.createClient({ model: params.model });
    const startTime = Date.now();

    try {
      const messages = params.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await client.invoke(messages);
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
          prompt_tokens: Math.ceil(JSON.stringify(messages).length / 4),
          completion_tokens: Math.ceil(content.length / 4),
          total_tokens: Math.ceil(
            (JSON.stringify(messages).length + content.length) / 4,
          ),
        },
        model: this.defaultModel,
        created_at: new Date(startTime),
      };
    } catch (error) {
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }
}
