import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import {
  Logger,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  ValidationPipe,
} from '@nestjs/common';
import { StockModule } from './stock.module';

@Catch()
class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorFilter');

  catch(error: Error, host: ArgumentsHost) {
    this.logger.error(`Uncaught exception: ${error.message}`, error.stack);
  }
}

/**
 * Future improvements:
 * TODO: Implement real-time stock data updates
 * TODO: Add caching layer for frequently accessed stock data
 * TODO: Implement rate limiting for external API calls
 * TODO: Add circuit breakers for third-party services
 * TODO: Implement data validation for stock updates
 * TODO: Add historical data tracking and analytics
 * TODO: Implement market trend analysis features
 * TODO: Add alerts system for price movements
 * TODO: Implement batch processing for large datasets
 */
async function bootstrap() {
  const logger = new Logger('Stock Microservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StockModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.STOCK_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.STOCK_SERVICE_PORT || '4200'),
        retryAttempts: 3,
        retryDelay: 1000,
      },
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Add global error handler
  app.useGlobalFilters(new ErrorFilter());

  await app.listen();
  logger.log(
    `Stock microservice is listening on ${process.env.STOCK_SERVICE_HOST || 'localhost'}:${process.env.STOCK_SERVICE_PORT || '4200'}`,
  );

  // Log configuration for debugging
  logger.debug('Stock Service Configuration:', {
    host: process.env.STOCK_SERVICE_HOST || 'localhost',
    port: process.env.STOCK_SERVICE_PORT || '4200',
    nodeEnv: process.env.NODE_ENV || 'development',
    retryAttempts: 3,
    retryDelay: 1000,
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, starting graceful shutdown...');
    await app.close();
    logger.log('Stock microservice terminated gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('Received SIGINT, starting graceful shutdown...');
    await app.close();
    logger.log('Stock microservice terminated gracefully');
    process.exit(0);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

bootstrap().catch((err) => {
  const logger = new Logger('Stock Microservice');
  logger.error('Failed to start Stock Microservice:', err);
  process.exit(1);
});
