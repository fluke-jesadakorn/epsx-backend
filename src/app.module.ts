import { Module } from '@nestjs/common';
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
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        synchronize: false, // Set to true only in development
        ssl: configService.get('DB_SSL') === 'true',
      }),
      inject: [ConfigService],
    }),
    EventStoreModule,
    ExchangeModule,
    StockModule,
    FinancialModule,
    HealthCheckModule,
    GatewayModule,
    AuthModule,
  ],
})
export class AppModule {}
