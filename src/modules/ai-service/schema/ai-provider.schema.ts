/**
 * Schema definitions for AI provider configurations and interactions
 */

// Base configuration for AI providers
export interface AIProviderConfig {
  baseURL: string;
  apiKey: string;
  headers?: Record<string, string>;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  maxRetries?: number;
}

// Provider-specific configurations
export interface OpenRouterConfig extends AIProviderConfig {
  siteUrl?: string;
  siteName?: string;
}

export interface OllamaConfig extends AIProviderConfig {
  modelPath?: string;
  contextSize?: number;
}

// AI Provider interface definition
export interface AIProvider {
  createClient(config: AIProviderConfig): any;
  validateConfig(config: AIProviderConfig): void;
}

// AI Response schemas
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
  responseFormat?: {
    type: 'text' | 'json_object';
  };
}

/**
 * Schema for AI response validation
 * Used to ensure AI responses match expected formats
 * 
 * TODO: Future Enhancements
 * - Add support for streaming responses
 * - Add function calling schemas
 * - Add support for multi-modal inputs
 * - Add response quality metrics
 * - Add support for response templating
 */
export interface AIResponseValidation {
  requiredFields: string[];
  fieldTypes: {
    [key: string]: 'string' | 'number' | 'boolean' | 'object' | 'array';
  };
  constraints?: {
    [key: string]: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      enum?: any[];
    };
  };
}

// Error handling schema
export interface AIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

// Provider Factory Types
export type ProviderType = 'openrouter' | 'ollama';

export interface ProviderFactoryConfig {
  type: ProviderType;
  config: AIProviderConfig;
}
