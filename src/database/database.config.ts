import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Exchange } from './entities/exchange.entity';
import { Stock } from './entities/stock.entity';
import { Financial } from './entities/financial.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mongodb',
  url: configService.get<string>('MONGODB_URL'),
  entities: [Exchange, Stock, Financial],
  synchronize: false, // Disable automatic schema synchronization to manage indexes manually
  // TODO: Add retry logic and better error handling for database connections
  /**
   * TODO: Future Improvements:
   * - Add connection pooling configuration
   * - Implement retry mechanism
   * - Add support for replica sets
   * - Implement change streams
   * - Add database monitoring and metrics
   * - Support MongoDB Atlas features
   * - Add caching layer
   * - Implement transaction support
   * - Add GridFS support for file storage
   */
});
