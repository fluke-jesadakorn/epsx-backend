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

// Provider Configs
export interface OpenRouterConfig extends AIProviderConfig {
  type: ProviderType.OPENROUTER;
}

export interface OllamaConfig extends AIProviderConfig {
  type: ProviderType.OLLAMA;
}

export interface AiQueryResponse {
  success: boolean;
  data: any[];
  analysis: string;
  meta: {
    executionTime: number;
    timestamp: string;
  };
}

export interface AIResponseValidation {
  isValid: boolean;
  errors?: string[];
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}

export interface ProviderFactoryConfig {
  providers: {
    [key in ProviderType]?: AIProviderConfig;
  };
  defaultProvider: ProviderType;
}

// SQL Query Types
export interface SqlQueryResult {
  query: string;
  params: any[];
  results: any[];
}

export interface SqlQueryContext {
  tables: {
    [key: string]: any;
  };
  joins?: {
    [key: string]: {
      table: string;
      condition: string;
    };
  };
  views?: {
    [key: string]: string;
  };
}

export interface SqlQueryValidation {
  paramTypes?: {
    [key: string]: string;
  };
  allowedOperations?: string[];
  requiredTables?: string[];
  isValid?: boolean;
  errors?: string[];
}

export interface QueryTemplate {
  name: string;
  template: string;
  description?: string;
  parameters: string[];
}

// TODO: Future enhancements
// - Add support for streaming responses
// - Add function calling types
// - Add multi-modal input types
// - Add response quality metric types
// - Add response templating types
// - Add query optimization types
// - Add table relationship types
