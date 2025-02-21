import {
  AIProviderConfig,
  OpenRouterConfig,
  OllamaConfig,
  AIProvider,
  AIMessage,
  AIRequestOptions,
  AIResponseValidation,
  AIError,
  ProviderType,
  ProviderFactoryConfig,
} from '../types/ai.types';

// Re-export types from centralized location
export type {
  AIProviderConfig,
  OpenRouterConfig,
  OllamaConfig,
  AIProvider,
  AIMessage,
  AIRequestOptions,
  AIResponseValidation,
  AIError,
  ProviderType,
  ProviderFactoryConfig,
};

// TODO: Future Enhancements
// - Add support for streaming responses
// - Add function calling schemas
// - Add support for multi-modal inputs
// - Add response quality metrics
// - Add support for response templating
