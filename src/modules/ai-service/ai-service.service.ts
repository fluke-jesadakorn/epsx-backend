import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AiQueryDto } from './dto/ai-query.dto';
import { ChatQueryDto } from './dto/chat-query.dto';
import { AiQueryService } from './ai-query.service';
import { AiQueryResponse } from './types';
import { AIMessage } from './schema/ai-provider.schema';
import { timeout } from 'rxjs/operators';
import { from, retry, catchError } from 'rxjs';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

@Injectable()
export class AiServiceService {
  private readonly logger = new Logger(AiServiceService.name);

  constructor(
    @InjectConnection()
    private connection: Connection,
    private aiQueryService: AiQueryService,
  ) {}

  async processQuery(queryDto: AiQueryDto): Promise<AiQueryResponse> {
    const startTime = Date.now();
    try {
      const sanitizedQuery = queryDto.sanitizeQuery();
      const { query, params = [] } = await this.aiQueryService.generateSqlQuery(sanitizedQuery);
      const result = await this.executeQueryWithRetry(query, params);

      return {
        success: true,
        data: result,
        analysis: 'Analysis will be implemented in future updates',
        meta: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      this.logger.error(`Error processing query: ${error.message}`, error.stack);
      
      if (error.name === 'TimeoutError') {
        throw new BadRequestException('Query timed out. Please try a more specific query or break it into smaller parts.');
      } else if (error.name === 'QueryFailedError') {
        throw new BadRequestException('Invalid query structure. Please rephrase your request.');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An unexpected error occurred while processing your query.');
      }
    }
  }

  private async executeQueryWithRetry(query: string, params: any[]): Promise<any[]> {
    if (!this.connection) {
      throw new InternalServerErrorException('Database connection not initialized');
    }

    try {
      // Convert SQL-like query to MongoDB aggregation pipeline
      const pipeline = this.convertToPipeline(query, params);
      const collection = this.determineCollection(query);

      return new Promise((resolve, reject) => {
        from(this.connection.collection(collection).aggregate(pipeline).toArray())
          .pipe(
            timeout(DEFAULT_TIMEOUT),
            retry({
              count: MAX_RETRIES,
              delay: (error, retryCount) => {
                const delay = Math.pow(2, retryCount - 1) * 1000;
                this.logger.debug(`Retrying query. Attempt ${retryCount} of ${MAX_RETRIES}. Delay: ${delay}ms`);
                return from([]).pipe(timeout(delay));
              }
            }),
            catchError(error => {
              this.logger.error(`Query execution error: ${error.message}`, error.stack);
              throw error;
            })
          )
          .subscribe({
            next: result => resolve(result || []),
            error: error => reject(error)
          });
      });
    } catch (error) {
      this.logger.error(`Failed to execute query: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to execute database query');
    }
  }

  /**
   * Converts SQL-like query to MongoDB aggregation pipeline
   * TODO: Implement proper SQL to MongoDB query conversion
   */
  private convertToPipeline(query: string, params: any[]): any[] {
    // For now, return a simple find query
    return [
      { $match: params[0] || {} }
    ];
  }

  /**
   * Determines the collection name from the query
   * TODO: Implement proper collection name extraction
   */
  private determineCollection(query: string): string {
    // For now, default to 'financials' collection
    return 'financials';
  }

  async handleChat(chatDto: ChatQueryDto): Promise<AIMessage> {
    try {
      return await this.aiQueryService.handleChatQuery(
        chatDto.messages,
        chatDto.options
      );
    } catch (error) {
      this.logger.error(`Error handling chat: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An unexpected error occurred while processing your chat request.');
      }
    }
  }

  /**
   * Future enhancements:
   * TODO: Implement rate limiting and request throttling
   * TODO: Add support for caching frequent queries
   * TODO: Add support for real-time data updates
   * TODO: Add support for export formats (CSV, Excel)
   * TODO: Add support for advanced visualization options
   * TODO: Add support for custom query templates
   * TODO: Implement request queueing for high-load scenarios
   * TODO: Add usage tracking and quota management
   */
}
