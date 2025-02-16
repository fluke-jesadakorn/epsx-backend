import { Injectable, Logger } from '@nestjs/common';
import { AIMessage, AIRequestOptions } from './schema/ai-provider.schema';
import { SqlQueryResult } from './schema/sql-query.schema';
import { ProviderFactory } from './providers/provider.factory';
import {
  AI_PROVIDER_CONFIG,
  DEFAULT_AI_OPTIONS,
} from './config/ai-provider.config';
import {
  QUERY_CONTEXT,
  QUERY_VALIDATION,
  SYSTEM_PROMPT,
} from './config/query-rules.config';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AiQueryService {
  private readonly logger = new Logger(AiQueryService.name);
  private readonly model: BaseChatModel;
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
    this.model = this.provider.createClient(this.config);
  }

  private convertToLangChainMessages(messages: AIMessage[]): BaseMessage[] {
    return messages.map(msg => {
      const content = msg.content;
      switch (msg.role) {
        case 'system':
          return new SystemMessage(content);
        case 'user':
          return new HumanMessage(content);
        case 'assistant':
          return new HumanMessage(content); // LangChain's AIChatMessage is internal
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });
  }

  async generateSqlQuery(naturalQuery: string): Promise<SqlQueryResult> {
    try {
      this.logger.debug(`Generating SQL query for: ${naturalQuery}`);

      const outputParser = new JsonOutputParser<{ query: string; parameters: any[] }>();

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

      const langChainMessages = this.convertToLangChainMessages(messages);
      const result = await this.model.invoke(langChainMessages);
      
      return {
        role: 'assistant',
        content: result.content.toString(),
      };
    } catch (error) {
      this.logger.error('Error processing chat query:', error);
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
}
