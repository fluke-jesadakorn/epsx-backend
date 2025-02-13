import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckController } from './health-check.controller';
import { HealthCheckService } from './health-check.service';

/**
 * Future improvements:
 * TODO: Add health check strategy providers
 * TODO: Add configurable health check thresholds
 * TODO: Implement custom health indicators
 * TODO: Add health check event subscribers
 */
@Module({
  imports: [HttpModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthCheckModule {}
