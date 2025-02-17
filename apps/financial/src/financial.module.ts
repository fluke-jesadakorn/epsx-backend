import { Module } from '@nestjs/common';
import { HttpService } from './http.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { FinancialFetchService } from './services/financial-fetch.service';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';
import {
  Financial,
  FinancialSchema,
} from './database/schemas/financial.schema';
import { Stock, StockSchema } from './database/schemas/stock.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
  ],
  controllers: [FinancialController],
  providers: [
    FinancialService,
    FinancialFetchService,
    FetchStateService,
    FinancialDataService,
    WorkerPoolService,
    HttpService,
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
