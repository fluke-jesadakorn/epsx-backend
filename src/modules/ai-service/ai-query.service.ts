import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AIMessage, AIRequestOptions } from './schema/ai-provider.schema';
import { SqlQueryResult } from './schema/sql-query.schema';
import { ProviderFactory } from './providers/provider.factory';
import { AI_PROVIDER_CONFIG, DEFAULT_AI_OPTIONS } from './config/ai-provider.config';
import { QUERY_CONTEXT, QUERY_VALIDATION, SYSTEM_PROMPT } from './config/query-rules.config';

@Injectable()
export class AiQueryService {
  private readonly logger = new Logger(AiQueryService.name);
  private readonly openai: OpenAI;
  private readonly provider;
  private readonly config;

  constructor() {
    const useLocalOllama = process.env.USE_LOCAL_OLLAMA === 'true';
    const providerType = useLocalOllama ? 'ollama' : 'openrouter';
    this.provider = ProviderFactory.getProvider(providerType);

    const baseConfig = AI_PROVIDER_CONFIG[providerType];
    this.config = {
      ...baseConfig,
      apiKey: useLocalOllama ? 'ollama' : process.env.OPENROUTER_API_KEY,
    };

    if (!this.config.apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is required when not using local Ollama',
      );
    }

    this.provider.validateConfig(this.config);
    this.openai = this.provider.createClient(this.config);
  }

  async generateSqlQuery(naturalQuery: string): Promise<SqlQueryResult> {
    try {
      this.logger.debug(`Generating SQL query for: ${naturalQuery}`);

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: naturalQuery,
        },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages,
        ...DEFAULT_AI_OPTIONS
      });

      if (!response?.choices?.[0]?.message?.content) {
        this.logger.error(
          'Invalid AI response structure:',
          JSON.stringify(response, null, 2),
        );
        throw new Error('No response content received from AI');
      }

      const result = JSON.parse(response.choices[0].message.content);
      
      this.validateGeneratedQuery(result);

      return {
        query: result.query,
        params: result.parameters || []
      };
    } catch (error) {
      this.logger.error('Error generating SQL query:', error);
      throw new Error(`Failed to generate SQL query: ${error.message}`);
    }
  }

  private validateGeneratedQuery(result: any): void {
    if (!result.query || typeof result.query !== 'string') {
      throw new Error('Generated query must be a string');
    }

    const query = result.query.toUpperCase();
    
    if (!QUERY_VALIDATION.allowedOperations.some(op => query.includes(op))) {
      throw new Error('Query contains unsupported operations');
    }

    if (!QUERY_VALIDATION.requiredTables.some(table => 
      query.includes(table.toUpperCase())
    )) {
      throw new Error('Query must include required tables');
    }

    if (result.parameters && !Array.isArray(result.parameters)) {
      throw new Error('Parameters must be an array');
    }
  }

  /**
   * Future enhancements:
   * TODO: Add support for query result caching
   * TODO: Add support for query execution plans
   * TODO: Add support for query optimization suggestions
   * TODO: Add support for custom query templates
   * TODO: Add support for query result validation
   * TODO: Add support for query performance metrics
   * TODO: Add support for query history tracking
   * TODO: Add support for query suggestions based on history
   */
}
