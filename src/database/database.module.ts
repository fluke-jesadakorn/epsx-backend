import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Exchange } from '../entities/exchange.entity';
import { Stock } from '../entities/stock.entity';
import { Financial } from '../entities/financial.entity';
import { Event } from '../entities/event.entity';
import { LoggerModule } from '../common/logger/logger.module';

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
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: false, // Automatically run migrations on app start
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Exchange, Stock, Financial, Event]),
  ],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
