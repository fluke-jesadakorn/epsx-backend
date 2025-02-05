import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '../../common/http/http.module';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock } from '../../database/entities/stock.entity';
import { Exchange } from '../../database/entities/exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, Exchange]),
    HttpModule,
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
