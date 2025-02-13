import { Module, OnModuleInit } from '@nestjs/common';

/**
 * Gateway Module - Manages microservice connections
 *
 * Port Configuration:
 * - HEALTH_CHECK_SERVICE: 3002
 * - LOGGING_SERVICE: 3003
 * - EXCHANGE_SERVICE: 3004
 * - STOCK_SERVICE: 3005
 * - FINANCIAL_SERVICE: 3006
 * - AI_SERVICE: 3007
 *
 * Future improvements:
 * TODO: Implement dynamic port allocation to prevent conflicts
 * TODO: Add service discovery mechanism
 * TODO: Add circuit breaker pattern for microservice communication
 * TODO: Implement retry mechanisms with exponential backoff
 * TODO: Add health check monitoring for all microservices
 */
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayService } from './gateway.service';
import { LogsGateway } from './logs.gateway';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HEALTH_CHECK_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.HEALTH_CHECK_PORT as string) || 3002,
        },
      },
      {
        name: 'LOGGING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.LOGGING_SERVICE_PORT as string) || 3003,
        },
      },
      {
        name: 'EXCHANGE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.EXCHANGE_SERVICE_PORT as string) || 3004, // Default port changed to match exchange.microservice.ts
        },
      },
      {
        name: 'STOCK_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.STOCK_SERVICE_PORT as string) || 3005,
        },
      },
      {
        name: 'FINANCIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.FINANCIAL_SERVICE_PORT as string) || 3006,
        },
      },
      {
        name: 'AI_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.AI_SERVICE_PORT as string) || 3007,
        },
      },
    ]),
  ],
  providers: [GatewayService, LogsGateway],
  controllers: [GatewayController],
  exports: [GatewayService, LogsGateway],
})
export class GatewayModule implements OnModuleInit {
  constructor(private readonly logsGateway: LogsGateway) {}

  onModuleInit() {
    // Microservices are automatically connected via ClientsModule configuration
    console.log('Gateway module initialized');
  }
}
