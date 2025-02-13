import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from './common/http/http.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { StockModule } from './modules/stock/stock.module';
import { FinancialModule } from './modules/financial/financial.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { GatewayModule } from './gateway/gateway.module';
import { AiServiceModule } from './modules/ai-service/ai-service.module';
import { LoggingModule } from './modules/logging/logging.module';
import { initializeFirebase } from './config/firebase.config';

/**
 * Main application module that configures:
 * - Environment variables and configuration
 * - Database connection with MongoDB
 * - Firebase initialization and integration
 * - Feature modules (Exchange, Stock, Financial)
 * - Supporting modules (Auth, Gateway, Health Check, Logging)
 *
 * Required Environment Variables:
 * - MONGODB_URL: MongoDB connection string
 * - NODE_ENV: Runtime environment (development/production)
 * - FIREBASE_* variables: Firebase configuration (see .env.example)
 *
 * TODO: Future Improvements:
 * MongoDB:
 * - Add MongoDB connection pooling configuration
 * - Implement retry mechanism for database connection
 * - Add support for MongoDB replica sets
 * - Implement MongoDB change streams
 * - Add database monitoring and metrics
 * - Support MongoDB Atlas features
 * - Add pagination with cursor support
 * - Add caching layer with MongoDB-specific optimizations
 * - Implement MongoDB aggregation pipelines
 * - Add MongoDB transaction support
 * - Implement MongoDB Atlas Search
 * - Add MongoDB TTL indexes for data lifecycle
 * - Implement MongoDB sharding strategy
 * - Add GridFS support for file storage
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    DatabaseModule,
    HttpModule,
    LoggingModule,
    ExchangeModule,
    StockModule,
    FinancialModule,
    HealthCheckModule,
    GatewayModule,
    AiServiceModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // Initialize Firebase when the application starts
    initializeFirebase();
  }
}
