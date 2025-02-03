import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Exchange } from '../entities/exchange.entity';
import { Stock } from '../entities/stock.entity';
import { Financial } from '../entities/financial.entity';
import { Event } from '../entities/event.entity';
import { LoggerModule } from '../common/logger/logger.module';

/**
 * Database module that handles database connections and entity management
 * 
 * TODO: Future enhancements:
 * Database Optimization:
 * - Add connection pooling configuration for better performance
 * - Add support for read replicas to scale read operations
 * - Implement database-specific optimizations (indexes, partitioning)
 * - Add comprehensive database monitoring and logging
 * - Implement connection retry logic for resilience
 * - Add support for multiple database connections if needed
 */
@Module({
  providers: [DatabaseService],
  imports: [
    LoggerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: +configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        entities: [Exchange, Stock, Financial, Event],
        synchronize: false,
        ssl: configService.get('DB_SSL') === 'true',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Exchange, Stock, Financial, Event]),
  ],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
