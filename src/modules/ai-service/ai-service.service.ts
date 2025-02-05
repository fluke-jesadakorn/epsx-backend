import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiQueryDto } from './dto/ai-query.dto';
import { AiQueryService } from './ai-query.service';
import { AiQueryResponse } from './types';
import { timeout } from 'rxjs/operators';
import { from, retry, catchError } from 'rxjs';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

@Injectable()
export class AiServiceService {
  private readonly logger = new Logger(AiServiceService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
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
    return new Promise((resolve, reject) => {
      from(this.dataSource.query(query, params))
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
            throw error;
          })
        )
        .subscribe({
          next: result => resolve(result),
          error: error => reject(error)
        });
    });
  }

  /**
   * Future enhancements:
   * TODO: Add support for caching frequent queries
   * TODO: Add support for real-time data updates
   * TODO: Add support for export formats (CSV, Excel)
   * TODO: Add support for advanced visualization options
   * TODO: Add support for custom query templates
   */
}
