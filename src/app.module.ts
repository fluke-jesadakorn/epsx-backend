import { Module, OnApplicationShutdown } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { StockModule } from './modules/stock/stock.module';
import { FinancialModule } from './modules/financial/financial.module';
import { Exchange } from './entities/exchange.entity';
import { Stock } from './entities/stock.entity';
import { Financial } from './entities/financial.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventStoreModule } from './modules/event-store/event-store.module';
import { Event } from './entities/event.entity';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { GatewayModule } from './gateway/gateway.module';
import { logger } from './utils/logger';

/**
 * Main application module that configures:
 * - Environment variables and configuration
 * - Database connection with TypeORM
 * - Feature modules (Exchange, Stock, Financial)
 * - Supporting modules (Auth, Gateway, Health Check)
 *
 * Required Environment Variables:
 * - DB_HOST: Database host address
 * - DB_PORT: Database port number
 * - DB_USERNAME: Database username
 * - DB_PASSWORD: Database password
 * - DB_NAME: Database name
 *
 * Optional Environment Variables:
 * - DB_SSL: Enable SSL for database connection (true/false)
 * - NODE_ENV: Runtime environment (development/production)
 *
 * TODO: Future Improvements:
 * - Add database connection pooling configuration
 * - Implement retry mechanism for database connection
 * - Add support for read replicas
 * - Implement database migration validation
 * - Add database monitoring and metrics
 * - Support multiple database connections
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Validate database configuration
        const dbPort = +configService.getOrThrow('DB_PORT');
        if (isNaN(dbPort) || dbPort <= 0) {
          throw new Error('Invalid DB_PORT: Must be a positive number');
        }

        const config = {
          type: 'postgres' as const,
          host: configService.getOrThrow('DB_HOST'),
          port: dbPort,
          username: configService.getOrThrow('DB_USERNAME'),
          password: configService.getOrThrow('DB_PASSWORD'),
          database: configService.getOrThrow('DB_NAME'),
          entities: [Exchange, Stock, Financial, Event],
          synchronize: false,
          ssl: configService.get('DB_SSL') === 'true',
          // Add some reasonable defaults for production
          extra: {
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
          },
          logging: configService.get('NODE_ENV') !== 'production',
        };

        logger.info('Database configuration validated successfully');
        return config;
      },
      inject: [ConfigService],
    }),
    EventStoreModule,
    ExchangeModule,
    StockModule,
    FinancialModule,
    HealthCheckModule,
    GatewayModule,
  ],
})
export class AppModule {}
