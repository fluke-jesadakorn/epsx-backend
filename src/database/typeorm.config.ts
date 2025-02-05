import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Exchange } from './entities/exchange.entity';
import { Stock } from './entities/stock.entity';
import { Financial } from './entities/financial.entity';
import { Event } from './entities/event.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mongodb',
  url: configService.get('MONGODB_URL'),
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
  entities: [Exchange, Stock, Financial, Event],
  migrations: ['src/database/migrations/*.ts'],
  /**
   * TODO: Future Improvements:
   * - Add connection pooling configuration
   * - Implement retry mechanism
   * - Add support for replica sets
   * - Add database monitoring and metrics
   * - Support MongoDB Atlas features
   * - Add caching layer
   * - Implement transaction support
   * - Add GridFS support for file storage
   */
});
