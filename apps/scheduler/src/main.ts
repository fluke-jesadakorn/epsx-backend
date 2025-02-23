import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const logger = new Logger('SchedulerMain');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(SchedulerModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.SCHEDULER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.SCHEDULER_SERVICE_PORT || '3003'),
    },
  });

  await app.listen();
  logger.log('Scheduler Microservice is running');
}

bootstrap();
