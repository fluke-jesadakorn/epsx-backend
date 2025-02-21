export enum ProviderType {
  OPENROUTER = 'openrouter',
  OLLAMA = 'ollama'
}

export interface AIProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  config?: AIProviderConfig;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIQueryParams {
  prompt: string;
  model?: string;
  options?: AIRequestOptions;
}

export interface AIResponse {
  text: string;
  usage: TokenUsage;
  model: string;
  created_at: Date;
}

export interface ChatQueryParams {
  messages: AIMessage[];
  model?: string;
  options?: AIRequestOptions;
}

export interface ChatResponse {
  message: AIMessage;
  usage: TokenUsage;
  model: string;
  created_at: Date;
}

export interface AIProvider {
  validateConfig(config: AIProviderConfig): boolean;
  createClient(config: AIProviderConfig): any;
  generateResponse(messages: AIMessage[], options?: AIRequestOptions): Promise<AIMessage>;
  query(params: AIQueryParams): Promise<AIResponse>;
  chat(params: ChatQueryParams): Promise<ChatResponse>;
}
