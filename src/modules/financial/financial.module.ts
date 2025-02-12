import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import {
  Financial,
  FinancialSchema,
} from '../../database/schemas/financial.schema';
import { Stock, StockSchema } from '../../database/schemas/stock.schema';
import { HttpModule } from '../../common/http/http.module';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialFetchService } from './services/financial-fetch.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';
import { Exchange, ExchangeSchema } from '../../database/schemas/exchange.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Exchange.name, schema: ExchangeSchema },
    ]),
    HttpModule,
  ],
  controllers: [FinancialController],
  providers: [
    FinancialService,
    FetchStateService,
    FinancialFetchService,
    FinancialDataService,
    WorkerPoolService,
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
