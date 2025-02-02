import { forwardRef, Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { FinancialService } from "./financial.service";
import { FinancialController } from "./financial.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Financial } from "../../entities/financial.entity";
import { StockModule } from "../stock/stock.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Financial]),
    forwardRef(() => StockModule),
    DatabaseModule,
  ],
  providers: [FinancialService],
  controllers: [FinancialController],
  exports: [FinancialService],
})
export class FinancialModule {}
