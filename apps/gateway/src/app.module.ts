import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { StockController } from './controllers/stock.controller';
import { ExchangeController } from './controllers/exchange.controller';
import { AiController } from './controllers/ai.controller';
import { FinancialController } from './controllers/financial.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      load: [],
      expandVariables: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    ClientsModule.registerAsync([
      {
        name: 'EXCHANGE_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('EXCHANGE_SERVICE_HOST', 'localhost'),
            port: configService.get('EXCHANGE_SERVICE_PORT', 4100),
            retryAttempts: 3,
            retryDelay: 1000,
            timeout: 5000,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'STOCK_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('STOCK_SERVICE_HOST', '0.0.0.0'),
            port: configService.get('STOCK_SERVICE_PORT', 4200),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'FINANCIAL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('FINANCIAL_SERVICE_HOST', '0.0.0.0'),
            port: configService.get('FINANCIAL_SERVICE_PORT', 4300),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AI_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AI_SERVICE_HOST', '0.0.0.0'),
            port: configService.get('AI_SERVICE_PORT', 4400),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    StockController,
    ExchangeController,
    AiController,
    FinancialController,
    HealthController,
  ],
  providers: [],
})
export class AppModule {
  // TODO: Add global exception filters
  // TODO: Add request logging
  // TODO: Add metrics collection
  // TODO: Add authentication guard
}

// Future enhancements:
// - Implement circuit breaker for microservice calls
// - Add request/response transformation interceptors
// - Add caching layer
// - Implement rate limiting
// - Add API versioning support
// - Add request validation pipe
