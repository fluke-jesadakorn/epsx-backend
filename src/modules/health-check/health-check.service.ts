import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import * as os from 'os';

/**
 * Future improvements:
 * TODO: Implement message acknowledgment patterns
 * TODO: Add message versioning for backward compatibility
 * TODO: Add message validation using class-validator
 * TODO: Implement message retries with exponential backoff
 * TODO: Add message payload validation
 * TODO: Implement circuit breaker for external service calls
 */
@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly httpService: HttpService,
  ) {}

  @MessagePattern({ cmd: 'health_check' })
  async handleHealthCheck() {
    return this.getHealthStatus();
  }

  @EventPattern('health_event')
  async handleHealthEvent(data: Record<string, any>) {
    this.logger.log(`Received health event: ${JSON.stringify(data)}`);
    await this.validateStartup();
  }

  /**
   * Check MongoDB connection status
   * @returns boolean indicating if MongoDB is connected
   */
  private async checkMongoDBConnection(): Promise<boolean> {
    try {
      const state = this.mongoConnection.readyState;
      return state === 1; // 1 = connected
    } catch (error) {
      this.logger.error('MongoDB connection check failed:', error);
      return false;
    }
  }

  /**
   * Check external services connectivity
   * TODO: Add more external service checks as needed
   * @returns Object containing status of each external service
   */
  private async checkExternalServices(): Promise<Record<string, boolean>> {
    const services: Record<string, string> = {
      // Add external service endpoints as needed
      // Example: 'auth-service': 'http://auth-service/health'
    };

    const results: Record<string, boolean> = {};

    for (const [service, url] of Object.entries(services)) {
      try {
        await firstValueFrom(this.httpService.get(url));
        results[service] = true;
      } catch (error) {
        this.logger.error(
          `External service check failed for ${service}:`,
          error,
        );
        results[service] = false;
      }
    }

    return results;
  }

  /**
   * Validate system resources
   * TODO: Add thresholds for memory and CPU usage
   * @returns Object containing system resource metrics
   */
  private checkSystemResources() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();

    return {
      memory: {
        total: totalMemory,
        free: freeMemory,
        usage: (1 - freeMemory / totalMemory) * 100,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      cpu: {
        loadAverage: cpuUsage,
        cores: os.cpus().length,
      },
      uptime: os.uptime(),
    };
  }

  /**
   * Get comprehensive health status of the application
   * @returns Object containing health check results
   */
  async getHealthStatus() {
    const [mongoStatus, externalServices] = await Promise.all([
      this.checkMongoDBConnection(),
      this.checkExternalServices(),
    ]);

    const systemResources = this.checkSystemResources();

    const status = mongoStatus ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        mongodb: mongoStatus,
        externalServices,
        systemResources,
      },
    };
  }

  /**
   * Perform startup validation
   * TODO: Add configurable thresholds for validation
   * @returns true if all checks pass
   * @throws Error if any critical check fails
   */
  async validateStartup(): Promise<boolean> {
    this.logger.log('Performing startup validation...');

    // Check MongoDB connection
    const mongoStatus = await this.checkMongoDBConnection();
    if (!mongoStatus) {
      throw new Error('MongoDB connection validation failed');
    }

    // Check external services
    const externalServices = await this.checkExternalServices();
    const failedServices = Object.entries(externalServices)
      .filter(([, status]) => !status)
      .map(([service]) => service);

    if (failedServices.length > 0) {
      throw new Error(
        `External services validation failed: ${failedServices.join(', ')}`,
      );
    }

    // Check system resources
    const resources = this.checkSystemResources();
    const memoryUsagePercent =
      (1 - resources.memory.free / resources.memory.total) * 100;

    // TODO: Make these thresholds configurable
    if (memoryUsagePercent > 256) {
      // throw new Error('Insufficient memory available');
      this.logger.warn('Insufficient memory available');
    }

    if (resources.cpu.loadAverage[0] > resources.cpu.cores * 0.9) {
      // throw new Error('CPU usage too high');
      this.logger.warn('CPU usage too high');
    }

    this.logger.log('Startup validation completed successfully');
    return true;
  }
}
