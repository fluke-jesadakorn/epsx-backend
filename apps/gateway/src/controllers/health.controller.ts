import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import {
  SwaggerHealthCheckResponse,
  SwaggerErrorResponse,
} from '@investing/common';
import { lastValueFrom, timeout, retry, catchError } from 'rxjs';

interface ServiceConfig {
  name: string;
  timeoutMs: number;
  retries: number;
  isCritical: boolean;
}

interface HealthStatus {
  status: string;
  message?: string;
  lastChecked: Date;
  responseTime?: number;
}

interface ServiceHealth {
  [key: string]: HealthStatus;
}

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly memoryThresholdMB: number;
  private readonly serviceHealthHistory: ServiceHealth = {};
  private readonly serviceConfigs: { [key: string]: ServiceConfig } = {
    stock_service: {
      name: 'STOCK_SERVICE',
      timeoutMs: 2000,
      retries: 2,
      isCritical: true,
    },
    financial_service: {
      name: 'FINANCIAL_SERVICE',
      timeoutMs: 2000,
      retries: 2,
      isCritical: true,
    },
    exchange_service: {
      name: 'EXCHANGE_SERVICE',
      timeoutMs: 2000,
      retries: 2,
      isCritical: true,
    },
    ai_service: {
      name: 'AI_SERVICE',
      timeoutMs: 3000,
      retries: 1,
      isCritical: false,
    },
  };

  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly configService: ConfigService,
    @Inject('STOCK_SERVICE') private readonly stockService: ClientProxy,
    @Inject('FINANCIAL_SERVICE') private readonly financialService: ClientProxy,
    @Inject('EXCHANGE_SERVICE') private readonly exchangeService: ClientProxy,
    @Inject('AI_SERVICE') private readonly aiService: ClientProxy,
  ) {
    this.memoryThresholdMB = this.configService.get<number>(
      'MEMORY_THRESHOLD_MB',
      150,
    );
  }

  private async checkMicroserviceHealth(
    service: ClientProxy,
    name: string,
  ): Promise<HealthIndicatorResult> {
    const config = this.serviceConfigs[name];
    const startTime = Date.now();

    try {
      const ping$ = service.send('ping', {}).pipe(
        timeout(config.timeoutMs),
        retry({
          count: config.retries,
          delay: 500, // Reduced delay between retries
          resetOnSuccess: true,
        }),
        catchError((error) => {
          this.logger.error(
            `Health check failed for ${name}: ${error.message}`,
          );
          throw error;
        }),
      );

      await lastValueFrom(ping$);
      const responseTime = Date.now() - startTime;

      this.updateServiceHealth(name, {
        status: 'up',
        lastChecked: new Date(),
        responseTime,
      });

      return {
        [name]: {
          status: 'up',
          responseTime: `${responseTime}ms`,
          isCritical: config.isCritical,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.updateServiceHealth(name, {
        status: 'down',
        message: error.message,
        lastChecked: new Date(),
        responseTime,
      });

      return {
        [name]: {
          status: 'down',
          message: error.message,
          responseTime: `${responseTime}ms`,
          isCritical: config.isCritical,
          lastSuccessful: this.getLastSuccessfulCheck(name),
        },
      };
    }
  }

  private updateServiceHealth(name: string, status: HealthStatus): void {
    this.serviceHealthHistory[name] = status;
  }

  private getLastSuccessfulCheck(name: string): string | null {
    const history = this.serviceHealthHistory[name];
    if (history && history.status === 'up') {
      return history.lastChecked.toISOString();
    }
    return null;
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Get comprehensive system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health check results including all components',
    type: SwaggerHealthCheckResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Critical service(s) unavailable',
    type: SwaggerErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Health check failed',
    type: SwaggerErrorResponse,
  })
  async checkHealth() {
    try {
      const memoryThreshold = this.memoryThresholdMB * 1024 * 1024;
      const result = await this.health.check([
        () => this.mongoose.pingCheck('mongodb', { timeout: 2000 }),

        // Memory checks
        () => this.memory.checkHeap('memory_heap', memoryThreshold),
        () => this.memory.checkRSS('memory_rss', memoryThreshold),

        async () => {
          const checks = await Promise.all([
            this.checkMicroserviceHealth(this.stockService, 'STOCK_SERVICE'),
            this.checkMicroserviceHealth(
              this.financialService,
              'FINANCIAL_SERVICE',
            ),
            this.checkMicroserviceHealth(
              this.exchangeService,
              'EXCHANGE_SERVICE',
            ),
            this.checkMicroserviceHealth(this.aiService, 'AI_SERVICE'),
          ]);

          // Determine overall status based on critical services
          const criticalServiceDown = checks.some((check) => {
            const serviceName = Object.keys(check)[0];
            return (
              this.serviceConfigs[serviceName].isCritical &&
              check[serviceName].status === 'down'
            );
          });

          if (criticalServiceDown) {
            throw new Error('One or more critical services are down');
          }

          return Object.assign({}, ...checks);
        },
      ]);

      const memoryUsage = process.memoryUsage();

      return {
        status: result.status,
        info: {
          checks: result.info,
          system: {
            uptime: process.uptime(),
            memoryUsage: {
              heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
              heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
              rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
            },
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Health Check Error]:', error);
      const failedServices = Object.entries(this.serviceHealthHistory)
        .filter(([_, status]) => status.status === 'down')
        .reduce((acc, [name, status]) => {
          acc[name] = {
            status: status.status,
            message: status.message,
            lastChecked: status.lastChecked,
            responseTime: status.responseTime,
            isCritical: this.serviceConfigs[name].isCritical,
          };
          return acc;
        }, {});

      return {
        status: 'error',
        info: {
          error: error.message,
          failedServices,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Service monitoring optimizations:
   * - Timeouts reduced to 2000ms for critical services and 3000ms for non-critical
   * - Retry attempts limited to 2 for quicker failure detection
   * - Retry delay reduced to 500ms to minimize total check time
   * - resetOnSuccess enabled to maintain service responsiveness tracking
   *
   * Future improvements:
   * TODO: Implement Redis-based health check response caching with configurable TTL
   * TODO: Add rate limiting based on configuration
   * TODO: Add custom health check strategies through configuration
   * TODO: Add webhook notifications for status changes (if configured)
   * TODO: Implement circuit breaker pattern for failing services
   * TODO: Add metrics collection for response times and error rates
   * TODO: Add adaptive timeouts based on service performance history
   * TODO: Implement service dependency mapping and cascading status updates
   * TODO: Add configuration for maintenance windows
   * TODO: Implement health check throttling for degraded services
   */
}
