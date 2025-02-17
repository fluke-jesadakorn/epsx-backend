import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { AiModule } from './ai.module';

@Catch()
class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorFilter');

  catch(error: Error, host: ArgumentsHost) {
    this.logger.error(`Uncaught exception: ${error.message}`, error.stack);
  }
}

/**
 * Future improvements:
 * TODO: Implement caching for frequent AI queries
 * TODO: Add rate limiting for AI provider calls
 * TODO: Implement fallback providers if primary provider fails
 * TODO: Add monitoring for AI response quality
 * TODO: Implement request queueing for high load scenarios
 * TODO: Add automated model performance tracking
 * TODO: Consider implementing model versioning
 * TODO: Add configuration validation to ensure port is within valid range
 * TODO: Add graceful shutdown with port release
 * TODO: Implement service discovery integration
 */
async function bootstrap() {
  const logger = new Logger('AiMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AiModule,
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(process.env.AI_SERVICE_PORT || '4400'),
        retryAttempts: 3,
        retryDelay: 1000,
      },
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  // Add global error handler
  app.useGlobalFilters(new ErrorFilter());

  await app.listen();
  logger.log(
    `AI Microservice is listening on port ${process.env.AI_SERVICE_PORT || '4400'}`,
  );

  // Log configuration for debugging
  logger.debug('AI Service Configuration:', {
    port: process.env.AI_SERVICE_PORT || '4400',
    nodeEnv: process.env.NODE_ENV || 'development',
  });

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);
      await app.close();
      logger.log('AI microservice terminated gracefully');
      process.exit(0);
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('AiMicroservice');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap().catch((err) => {
  const logger = new Logger('AiMicroservice');
  logger.error('Failed to start AI Microservice:', err);
  process.exit(1);
});
