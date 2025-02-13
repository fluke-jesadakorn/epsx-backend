import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { LoggingModule } from './logging.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('LoggingBootstrap');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LoggingModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3003,
      },
    },
  );
  await app.listen();
  logger.log('Logging microservice started on port 3002');
}

bootstrap();
