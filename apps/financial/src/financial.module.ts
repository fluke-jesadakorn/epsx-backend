import { Module } from '@nestjs/common';
import { HttpService } from './http.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Financial, FinancialSchema } from './schemas/financial.schema';
import { Stock, StockSchema } from './schemas/stock.schema';
import { UrlIndex, UrlIndexSchema } from './schemas/url-index.schema';
import { EpsGrowth, EpsGrowthSchema } from './schemas/eps-growth.schema';
import { FinancialService } from './financial.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FinancialController } from './financial.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
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
      { name: UrlIndex.name, schema: UrlIndexSchema },
      { name: EpsGrowth.name, schema: EpsGrowthSchema },
    ]),
    ClientsModule.register([
      {
        name: 'FINANCIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4300,
        },
      },
    ]),
  ],
  controllers: [FinancialController],
  providers: [HttpService, FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
