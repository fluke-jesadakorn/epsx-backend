import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FinancialModule } from './financial.module';
import { logger } from '../../utils/logger';

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
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FinancialModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: parseInt(process.env.FINANCIAL_SERVICE_PORT || '3006'),
        retryAttempts: 3,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
  logger.info('Financial Microservice is listening on port 3006');
}

bootstrap().catch((err) => {
  logger.error('Failed to start Financial Microservice:', err);
  process.exit(1);
});
