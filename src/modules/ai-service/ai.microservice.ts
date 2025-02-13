import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AiServiceModule } from './ai-service.module';
import { logger } from '../../utils/logger';

/**
 * Future improvements:
 * TODO: Implement caching for frequent AI queries
 * TODO: Add rate limiting for AI provider calls
 * TODO: Implement fallback providers if primary provider fails
 * TODO: Add monitoring for AI response quality
 * TODO: Implement request queueing for high load scenarios
 * TODO: Add automated model performance tracking
 * TODO: Consider implementing model versioning
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AiServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: parseInt(process.env.AI_SERVICE_PORT || '3007'),
        retryAttempts: 3,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
  logger.info('AI Microservice is listening on port 3007');
}

bootstrap().catch((err) => {
  logger.error('Failed to start AI Microservice:', err);
  process.exit(1);
});
