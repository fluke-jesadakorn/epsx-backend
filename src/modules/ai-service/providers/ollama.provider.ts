import { Ollama } from '@langchain/community/llms/ollama';
import { AIProvider, AIProviderConfig } from '../schema/ai-provider.schema';
import { ChatOllama } from '@langchain/community/chat_models/ollama';

export class OllamaProvider implements AIProvider {
  createClient(config: AIProviderConfig) {
    const baseURL = config.baseURL || 'http://localhost:11434';
    const modelName = config.model || 'mistral-small:latest';

    return new ChatOllama({
      baseUrl: baseURL,
      model: modelName,
      temperature: 0.3,
    });
  }

  validateConfig(config: AIProviderConfig): void {
    if (!config.baseURL) {
      throw new Error('Ollama baseURL is required');
    }
  }
}
