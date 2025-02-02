import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthCheckService {
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      // TODO: Add database connection check in future
      // TODO: Add external service health checks in future
    };
  }
}
