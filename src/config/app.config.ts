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
    type: 'mongodb';
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    synchronize: boolean;
    logging: boolean;
    entities: string[];
    migrations: string[];
  };
  logger: {
    level: string;
    colors: Record<string, string>;
    timestamp: boolean;
    debug: boolean;
  };
  http: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    headers?: Record<string, string>;
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
        .setDescription(
          `
API documentation for the Investing Scrape Data application.

Features:
- Financial data scraping and analysis
- Stock information management
- Exchange data tracking
- Dynamic SQL querying with AI analysis
- Natural language querying for financial data

Available endpoints are organized into the following categories:
- Financial: Endpoints for managing financial data and EPS growth rankings
- Stock: Endpoints for managing stock information
- Exchange: Endpoints for managing exchange data
- Dynamic Query: AI-powered SQL query execution
- Text Query: Natural language processing for financial data queries

For more information, visit our repository or contact the development team.
        `,
        )
        .setVersion('1.0')
        .addTag(
          'Financial',
          'Endpoints for managing financial data and analysis',
        )
        .addTag('Stock', 'Endpoints for managing stock information')
        .addTag('Exchange', 'Endpoints for managing exchange data')
        .addTag('Dynamic Query', 'AI-powered SQL query execution endpoints')
        .addTag('Text Query', 'Natural language query processing endpoints')
        .addBearerAuth()
        .build(),
    },
    database: {
      type: 'mongodb',
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
      migrations: [
        join(__dirname, '..', 'database', 'migrations', '*.{ts,js}'),
      ],
    },
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      colors: {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[32m',
        debug: '\x1b[34m',
      },
      timestamp: process.env.LOG_TIMESTAMP !== 'false',
      debug: process.env.LOG_DEBUG === 'true',
    },
    http: {
      maxRetries: Number(process.env.HTTP_MAX_RETRIES) || 3,
      retryDelay: Number(process.env.HTTP_RETRY_DELAY) || 5000,
      timeout: Number(process.env.HTTP_TIMEOUT) || 10000,
      headers: {
        'User-Agent':
          process.env.HTTP_USER_AGENT ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
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
