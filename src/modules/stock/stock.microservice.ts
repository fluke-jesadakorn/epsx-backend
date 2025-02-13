import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { StockModule } from './stock.module';

/**
 * Future improvements:
 * TODO: Implement caching mechanism for frequently accessed stock data
 * TODO: Add rate limiting for scraping operations
 * TODO: Implement data validation and sanitization
 * TODO: Add monitoring and alerting for scraping failures
 * TODO: Implement concurrent scraping with worker threads
 * TODO: Add fallback mechanisms for external API failures
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StockModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(String(process.env.STOCK_SERVICE_PORT)) || 3005,
        retryAttempts: 3,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
  console.log(
    `Stock Microservice is running on port ${process.env.STOCK_SERVICE_PORT || 3004}`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start Stock Microservice:', error);
  process.exit(1);
});
