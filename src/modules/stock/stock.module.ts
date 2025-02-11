import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '../../common/http/http.module';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock, StockSchema } from '../../database/schemas/stock.schema';
import { Exchange, ExchangeSchema } from '../../database/schemas/exchange.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema },
      { name: Exchange.name, schema: ExchangeSchema }
    ]),
    HttpModule,
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
