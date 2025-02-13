import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggingMicroservice } from './logging.microservice';

@Global()
@Module({
  imports: [
    ClientsModule.register([{
      name: 'LOGGING_SERVICE',
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3003
      }
    }])
  ],
  providers: [LoggingMicroservice],
  exports: [ClientsModule]
})
export class LoggingModule {}
