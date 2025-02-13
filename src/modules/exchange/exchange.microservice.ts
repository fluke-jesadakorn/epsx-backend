import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExchangeModule } from './exchange.module';
import { logger } from '../../utils/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ExchangeModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: parseInt(process.env.EXCHANGE_SERVICE_PORT || '3004'), // Changed from 3002 to avoid conflict with logging service
      retryAttempts: 3,
      retryDelay: 1000,
    },
  });

  await app.listen();
  logger.info('Exchange Microservice is listening');
}

bootstrap().catch((err) => {
  logger.error('Failed to start Exchange Microservice:', err);
  process.exit(1);
});
