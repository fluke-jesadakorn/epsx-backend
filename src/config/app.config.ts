import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

export interface AppConfig {
  port: number;
  cors: CorsOptions;
  staticAssets: {
    path: string;
  };
  swagger: {
    path: string;
    config: ReturnType<typeof DocumentBuilder.prototype.build>;
  };
  database: {
    type: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    ssl: boolean;
    entities: string[];
    migrations: string[];
  };
  logger: {
    level: string;
    colors: Record<string, string>;
    timestamp: boolean;
    debug: boolean;
  };
  stock: {
    maxParallelRequests: number;
    stockBatchSize: number;
    batchDelay: number;
  };
}

export const getAppConfig = (): AppConfig => {
  const port = Number(process.env.PORT) || 3000;

  return {
    port,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    staticAssets: {
      path: join(__dirname, '..', '..', 'public'),
    },
    swagger: {
      path: 'docs',
      config: new DocumentBuilder()
        .setTitle('Investing Scrape Data API')
        .setDescription('API documentation for the Investing Scrape Data application')
        .setVersion('1.0')
        .addTag('investing')
        .build(),
    },
    database: {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'investing',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true',
      entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    },
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      colors: {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[90m',
      },
      timestamp: process.env.LOG_TIMESTAMP !== 'false',
      debug: process.env.LOG_DEBUG === 'true',
    },
    stock: {
      maxParallelRequests: Number(process.env.STOCK_MAX_PARALLEL_REQUESTS) || 3,
      stockBatchSize: Number(process.env.STOCK_BATCH_SIZE) || 100,
      batchDelay: Number(process.env.STOCK_BATCH_DELAY) || 1000,
    },
  };
};

/**
 * TODO: Future enhancements:
 * API Configuration:
 * - Add support for multiple CORS configurations
 * - Implement rate limiting configuration
 * - Add compression settings
 * - Implement security headers configuration
 * - Add API versioning configuration
 * - Implement custom middleware configurations
 * - Add health check endpoint configuration
 * - Implement metrics endpoint configuration
 * - Add documentation customization options
 * - Implement caching configuration
 * 
 * Stock Service Configuration:
 * - Add retry configuration for failed requests
 * - Implement dynamic batch sizing based on load
 * - Add timeout configurations per exchange
 * - Implement circuit breaker settings
 * - Add rate limit configurations per exchange
 * - Implement custom user agent settings
 * - Add proxy configuration support
 * - Implement custom headers per exchange
 */
