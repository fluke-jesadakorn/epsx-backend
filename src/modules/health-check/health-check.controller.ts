import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';

/**
 * Future improvements:
 * TODO: Add health check response caching
 * TODO: Add rate limiting for health check endpoints
 * TODO: Implement health check metrics collection
 * TODO: Add custom health check strategies
 */
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  async checkHealth() {
    const healthStatus = await this.healthCheckService.handleHealthCheck();
    return healthStatus;
  }
}
