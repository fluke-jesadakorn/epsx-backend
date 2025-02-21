// AI Query Types
import { ProviderType, AIProviderConfig, AIMessage, AIRequestOptions, AIProvider } from './interfaces';

export { ProviderType, AIProviderConfig, AIMessage, AIRequestOptions, AIProvider };

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
