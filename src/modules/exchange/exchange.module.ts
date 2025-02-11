import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { Exchange, ExchangeSchema } from '../../database/schemas/exchange.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Exchange.name, schema: ExchangeSchema }])],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
