import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIMessage,
  AIRequestOptions,
} from '@app/common/schemas/ai-provider.schema';
import { SqlQueryResult } from '@app/common/schemas/sql-query.schema';
import { ProviderFactory } from './providers/provider.factory';
import { getAiProviderConfig } from './config/ai-provider.config';
import { QUERY_VALIDATION, SYSTEM_PROMPT } from './config/query-rules.config';
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AiQueryService {
  private readonly logger = new Logger(AiQueryService.name);
  private readonly model: BaseChatModel;
  private readonly provider;
  private readonly config;

  constructor(private readonly configService: ConfigService) {
    const useLocalOllama =
      configService.get<string>('USE_LOCAL_OLLAMA') === 'true';
    const providerType = useLocalOllama ? 'ollama' : 'openrouter';
    const baseConfig = getAiProviderConfig(this.configService)[providerType];
    const apiKey = useLocalOllama
      ? 'ollama'
      : configService.get<string>('OPENROUTER_API_KEY');

    this.config = {
      ...baseConfig,
      apiKey,
      baseUrl: this.configService.get<string>('OPENROUTER_BASE_URL'),
      model: this.configService.get<string>('OPENROUTER_MODEL'),
      type: providerType
    };

    this.provider = ProviderFactory.getProvider(providerType, this.config);

    if (!useLocalOllama && !apiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is required when not using local Ollama',
      );
    }

    this.provider.validateConfig(this.config);
    this.model = this.provider.createClient(this.config);
    // TODO: Consider adding a retry mechanism for model creation in case of failure
  }

  private convertToLangChainMessages(messages: AIMessage[]): BaseMessage[] {
    // TODO: Add support for other message roles (e.g., function calls)
    return messages.map((msg) => {
      const content = msg.content;
      switch (msg.role) {
        case 'system':
          return new SystemMessage(content);
        case 'user':
          return new HumanMessage(content);
        case 'assistant':
          return new SystemMessage(content); // Convert assistant messages to system messages for better context
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });
  }

  async generateSqlQuery(naturalQuery: string): Promise<SqlQueryResult> {
    try {
      this.logger.debug(`Generating SQL query for: ${naturalQuery}`);

      const outputParser = new JsonOutputParser<{
        query: string;
        parameters: any[];
      }>();

      const prompt = PromptTemplate.fromTemplate(`
        {system_prompt}
        
        Your response must be a JSON object with two fields:
        - query: The SQL query string
        - parameters: An array of parameters for the query
        
        User query: {query}
      `);

      const chain = prompt.pipe(this.model).pipe(outputParser);

      const result = await chain.invoke({
        system_prompt: SYSTEM_PROMPT,
        query: naturalQuery,
      });

      this.validateGeneratedQuery(result);

      return {
        query: result.query,
        params: result.parameters || [],
        results: [], // Initialize with empty array since results will be populated after query execution
      };
    } catch (error) {
      this.logger.error('Error generating SQL query:', error);
      // TODO: Implement more robust error handling and logging
      // Consider logging the specific error type and stack trace
      throw new Error(`Failed to generate SQL query: ${error.message}`);
    }
  }

  private validateGeneratedQuery(result: any): void {
    if (!result.query || typeof result.query !== 'string') {
      throw new Error('Generated query must be a string');
    }

    const query = result.query.toUpperCase();

    if (
      QUERY_VALIDATION.allowedOperations?.length &&
      !QUERY_VALIDATION.allowedOperations.some((op) => query.includes(op))
    ) {
      throw new Error('Query contains unsupported operations');
    }

    if (
      QUERY_VALIDATION.requiredTables?.length &&
      !QUERY_VALIDATION.requiredTables.some((table) =>
        query.includes(table.toUpperCase()),
      )
    ) {
      throw new Error('Query must include required tables');
    }

    if (result.parameters && !Array.isArray(result.parameters)) {
      throw new Error('Parameters must be an array');
    }
  }

  async handleChatQuery(
    messages: AIMessage[],
    options?: AIRequestOptions,
  ): Promise<AIMessage> {
    try {
      this.logger.debug('Processing chat query');

      this.logger.debug('Chat options:', {
        options,
        config: this.config,
        messages: messages.map(m => ({ role: m.role, contentLength: m.content.length }))
      });

      const langChainMessages = this.convertToLangChainMessages(messages);
      
      this.logger.debug('Processing chat query with options:', {
        messages: messages.map(m => ({ role: m.role, contentLength: m.content.length })),
        options,
        config: this.config
      });

      const result = await this.provider.chat({
        messages: langChainMessages,
        model: this.config.model,
        options: {
          ...options,
          config: {
            ...this.config,
            maxTokens: options?.maxTokens || (options as any)?.max_tokens || 100000,
            temperature: options?.temperature || 0.7
          }
        }
      });

      return result.message;
    } catch (error) {
      this.logger.error('Error processing chat query:', error);
      // TODO: Implement more robust error handling and logging
      // Consider logging the specific error type and stack trace
      throw new Error(`Failed to process chat query: ${error.message}`);
    }
  }

  /**
   * Future enhancements:
   * TODO: Add support for query result caching with LangChain Cache implementation
   * TODO: Add support for query execution plans using LangChain Agents
   * TODO: Add support for query optimization suggestions using LangChain Chain composition
   * TODO: Add support for custom query templates with LangChain PromptTemplates
   * TODO: Add support for query result validation using LangChain OutputParser
   * TODO: Add support for query performance metrics with LangChain Callbacks
   * TODO: Add support for query history tracking using LangChain Memory
   * TODO: Add support for query suggestions based on history using LangChain Retrieval
   */
  // TODO: Consider breaking this class down into smaller, more focused classes
}
