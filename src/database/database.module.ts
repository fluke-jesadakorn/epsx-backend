import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongooseConfig } from './mongoose.config';
import { Financial, FinancialSchema } from './schemas/financial.schema';
import { Stock, StockSchema } from './schemas/stock.schema';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongooseConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Financial.name, schema: FinancialSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Exchange.name, schema: ExchangeSchema }
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
