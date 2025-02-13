import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { HealthCheckModule } from './health-check.module';

/**
 * Future improvements:
 * TODO: Add message acknowledgment and retry mechanisms
 * TODO: Implement message validation using class-validator
 * TODO: Add message versioning for backward compatibility
 * TODO: Implement circuit breaker pattern for message handling
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    HealthCheckModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(String(process.env.HEALTH_CHECK_PORT)) || 3002,
        retryAttempts: 3,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
  console.log('Health Check Message Service is running on port 3003');
}

bootstrap().catch((error) => {
  console.error('Failed to start Health Check Message Service:', error);
  process.exit(1);
});
