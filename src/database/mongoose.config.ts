import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongooseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get<string>('MONGODB_URL'),
  // MongoDB driver options
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
