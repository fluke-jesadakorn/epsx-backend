// AI Provider Types
export interface AIProviderConfig {
  baseURL: string;
  apiKey?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export interface OpenRouterConfig extends AIProviderConfig {
  siteUrl?: string;
}

export interface OllamaConfig extends AIProviderConfig {
  modelPath?: string;
}

export interface AIProvider {
  createClient(config: AIProviderConfig): any;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponseValidation {
  requiredFields: string[];
  format?: string;
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}

export type ProviderType = 'openrouter' | 'ollama';

export interface ProviderFactoryConfig {
  type: ProviderType;
  config: AIProviderConfig;
}

// Query Types
export interface RawQueryResultSchema {
  columns: string[];
  rows: any[];
}

export interface BaseQueryResponseSchema {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CompleteQueryResponseSchema extends BaseQueryResponseSchema {
  data: any[];
  metadata?: any;
}

export interface SqlQueryResult {
  query: string;
  params?: any[];
}

export interface SqlQueryContext {
  tables: {
    [key: string]: any; // Table schema
  };
  conditions?: any;
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
  paramTypes: {
    [key: string]: string;
  };
  requiredParams?: string[];
  requiredTables?: string[];
  allowedOperations?: string[];
}

export interface QueryTemplate {
  name: string;
  template: string;
  validation?: SqlQueryValidation;
}

export interface AiQueryResponse {
  success: boolean;
  data?: any;
  error?: string;
  analysis?: string;
  meta?: {
    [key: string]: any;
  };
}
