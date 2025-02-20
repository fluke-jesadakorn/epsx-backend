import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { SchedulerService } from './scheduler.service';
import { FinancialSchedulerService } from './services/financial-scheduler.service';
import { FinancialHttpService } from './services/financial-http.service';
import { FinancialDataService } from './services/financial-data.service';
import { FinancialDbService } from './services/financial-db.service';

import {
  Financial,
  FinancialSchema,
  Stock,
  StockSchema,
} from '@app/common/schemas';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017',
      {
        dbName: process.env.MONGODB_DB_NAME || 'test',
      },
    ),
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
    ClientsModule.register([
      {
        name: 'FINANCIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.FINANCIAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.FINANCIAL_SERVICE_PORT || '4500'),
        },
      },
    ]),
  ],
  providers: [
    SchedulerService,
    FinancialSchedulerService,
    FinancialHttpService,
    FinancialDataService,
    FinancialDbService,
  ],
})
export class SchedulerModule {}
