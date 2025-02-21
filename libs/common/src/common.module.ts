import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonService } from './common.service';
import { Financial, FinancialSchema } from './schemas/financial.schema';
import { Stock, StockSchema } from './schemas/stock.schema';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Exchange.name, schema: ExchangeSchema },
    ]),
  ],
  providers: [CommonService],
  exports: [
    CommonService,
    MongooseModule,
  ],
})
export class CommonModule {}
