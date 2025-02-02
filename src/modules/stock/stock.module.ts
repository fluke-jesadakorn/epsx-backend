import { forwardRef, Module } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockController } from "./stock.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinancialModule } from "../financial/financial.module";
import { Stock } from "../../entities/stock.entity";
import { Exchange } from "../../entities/exchange.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, Exchange]),
    forwardRef(() => FinancialModule),
  ],
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
