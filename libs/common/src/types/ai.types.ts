export interface AIQueryParams {
  model: string;
  prompt: string;
  market_context?: any;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface AIResponse {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  created_at: Date;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatQueryParams extends Omit<AIQueryParams, 'prompt'> {
  messages: ChatMessage[];
  market_context?: any;
}

export interface ChatResponse extends Omit<AIResponse, 'text'> {
  message: ChatMessage;
}

export type ProviderType = 'openrouter' | 'ollama';

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface AIProvider {
  validateConfig(config: AIProviderConfig): boolean;
  createClient(config: AIProviderConfig): any;
  query(params: AIQueryParams): Promise<AIResponse>;
  chat(params: ChatQueryParams): Promise<ChatResponse>;
}

// TODO: Future enhancements
// - Add support for streaming responses
// - Add function calling capabilities
// - Add support for additional AI models
// - Add context window management
// - Add response caching
// - Add rate limiting and quota management
