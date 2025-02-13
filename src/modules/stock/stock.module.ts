import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '../../common/http/http.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
    ClientsModule.register([
      {
        name: 'STOCK_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3004
        }
      }
    ])
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
