import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import {
  Logger,
  ValidationPipe,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { ExchangeModule } from './exchange.module';

@Catch()
class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorFilter');

  catch(error: Error, host: ArgumentsHost) {
    this.logger.error('Detailed error info:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: (error as any).cause,
    });

    // Return error response in microservice format
    return {
      status: 'error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
}

/**
 * Future improvements:
 * TODO: Add circuit breaker pattern for external exchange API calls
 * TODO: Implement request throttling for rate limits
 * TODO: Add data validation for exchange rate updates
 * TODO: Implement caching for frequently requested exchange rates
 * TODO: Add monitoring for exchange rate data accuracy
 */
async function bootstrap() {
  const logger = new Logger('ExchangeMicroservice');

  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      ExchangeModule,
      {
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0', // Listen on all interfaces
          port: parseInt(process.env.EXCHANGE_SERVICE_PORT || '4100'),
          retryAttempts: 5,
          retryDelay: 1000,
        },
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      },
    );

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Add global error handler
    app.useGlobalFilters(new ErrorFilter());

    await app.listen();
    logger.log(
      `Exchange Microservice is listening on port ${process.env.EXCHANGE_SERVICE_PORT || '4100'}`,
    );

    // Log configuration for debugging
    logger.debug('Exchange Service Configuration:', {
      host: process.env.EXCHANGE_SERVICE_HOST || 'localhost',
      port: process.env.EXCHANGE_SERVICE_PORT || '4100',
      nodeEnv: process.env.NODE_ENV || 'development',
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('Received SIGTERM, starting graceful shutdown...');
      await app.close();
      logger.log('Exchange microservice terminated gracefully');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('Received SIGINT, starting graceful shutdown...');
      await app.close();
      logger.log('Exchange microservice terminated gracefully');
      process.exit(0);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    logger.error('Failed to initialize Exchange Microservice:', error);
    throw error;
  }
}

bootstrap().catch((err) => {
  const logger = new Logger('ExchangeMicroservice');
  logger.error('Failed to start Exchange Microservice:', err);
  process.exit(1);
});
