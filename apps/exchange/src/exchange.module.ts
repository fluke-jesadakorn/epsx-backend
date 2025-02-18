import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';

// TODO: Future Feature - Add caching layer to reduce database load
// TODO: Future Feature - Add rate limiting for scraping to avoid being blocked
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
      { name: Exchange.name, schema: ExchangeSchema },
    ]),
  ],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
