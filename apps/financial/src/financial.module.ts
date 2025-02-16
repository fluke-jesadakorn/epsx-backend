import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerUtil } from './utils/logger.util';
import { Financial, FinancialSchema } from './schemas/financial.schema';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { FetchStateService } from './services/fetch-state.service';
import { FinancialFetchService } from './services/financial-fetch.service';
import { FinancialDataService } from './services/financial-data.service';
import { WorkerPoolService } from './services/worker-pool.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
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
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
    ]),
  ],
  controllers: [FinancialController],
  providers: [
    FinancialService,
    FetchStateService,
    FinancialFetchService,
    FinancialDataService,
    WorkerPoolService,
    LoggerUtil,
  ],
})
export class FinancialModule {}
