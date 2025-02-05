import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';
import { Exchange } from './entities/exchange.entity';
import { Stock } from './entities/stock.entity';
import { Financial } from './entities/financial.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Exchange, Stock, Financial]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
