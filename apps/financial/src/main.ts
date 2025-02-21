import { NestFactory } from '@nestjs/core';
import { FinancialModule } from './financial.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  ValidationPipe,
  Logger,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorFilter');

  catch(error: Error, host: ArgumentsHost) {
    this.logger.error(`Uncaught exception: ${error.message}`, error.stack);
  }
}

/**
 * Future improvements:
 * TODO: Implement caching layer for frequently accessed financial data
 * TODO: Add circuit breakers for external API calls
 * TODO: Implement queue mechanism for batch processing
 * TODO: Add monitoring for financial data accuracy
 * TODO: Implement data versioning for historical tracking
 * TODO: Add automated data validation checks
 * TODO: Implement real-time financial data updates
 */
async function bootstrap() {
  const logger = new Logger('Financial Microservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FinancialModule,
    {
      transport: Transport.TCP,
      options: {
        port: parseInt(process.env.FINANCIAL_SERVICE_PORT || '4300', 10),
        retryAttempts: 3,
        retryDelay: 1000,
      },
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Add global error handler
  app.useGlobalFilters(new ErrorFilter());

  const configService = app.get(ConfigService);
  const port = parseInt(
    configService.get('FINANCIAL_SERVICE_PORT') || '4300',
    10,
  );

  await app.listen();
  logger.log(`Financial microservice is listening on port ${port}`);

  // Log configuration for debugging
  logger.debug('Financial Service Configuration:', {
    port: port,
    nodeEnv: process.env.NODE_ENV || 'development',
    retryAttempts: 3,
    retryDelay: 1000,
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, starting graceful shutdown...');
    await app.close();
    logger.log('Financial microservice terminated gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('Received SIGINT, starting graceful shutdown...');
    await app.close();
    logger.log('Financial microservice terminated gracefully');
    process.exit(0);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

bootstrap().catch((err) => {
  const logger = new Logger('Financial Microservice');
  logger.error('Failed to start Financial Microservice:', err);
  process.exit(1);
});
