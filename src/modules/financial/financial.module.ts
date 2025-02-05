import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { Financial } from '../../database/entities/financial.entity';
import { Stock } from '../../database/entities/stock.entity';
import { HttpModule } from '../../common/http/http.module';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialFetchService } from './services/financial-fetch.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Financial, Stock]),
    HttpModule,
  ],
  controllers: [FinancialController],
  providers: [
    FinancialService,
    FetchStateService,
    FinancialFetchService,
    FinancialDataService,
    WorkerPoolService
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
