import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Exchange,
  ExchangeSchema,
  Stock,
  StockSchema,
  Financial,
  FinancialSchema,
  EpsGrowth,
  EpsGrowthSchema,
} from './schemas';
import { MarketService } from './services/market.service';
import { HttpService } from './services/http.service';
import { MarketController } from './controllers/market.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/epsx'),
    MongooseModule.forFeature([
      { name: Exchange.name, schema: ExchangeSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Financial.name, schema: FinancialSchema },
      { name: EpsGrowth.name, schema: EpsGrowthSchema },
    ]),
  ],
  providers: [MarketService, HttpService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
