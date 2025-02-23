import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { MarketModule } from './market.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(MarketModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.MARKET_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.MARKET_SERVICE_PORT || '3002', 10),
    },
  });
  
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
  console.log('Market microservice is listening');
}
bootstrap();
