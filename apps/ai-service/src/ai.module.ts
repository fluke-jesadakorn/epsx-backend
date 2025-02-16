import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderFactory } from './providers/provider.factory';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { AiQueryService } from './ai-query.service';

// TODO: Future Feature - Add support for multiple AI providers configuration
// TODO: Future Feature - Add caching layer for frequent queries
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
  ],
  controllers: [AiServiceController],
  providers: [
    {
      provide: 'AI_PROVIDER',
      useFactory: () => {
        const providerType = process.env.AI_PROVIDER_TYPE || 'ollama';
        return ProviderFactory.getProvider(providerType);
      },
    },
    AiServiceService,
    AiQueryService,
  ],
  exports: ['AI_PROVIDER', AiServiceService, AiQueryService],
})
export class AiModule {}
