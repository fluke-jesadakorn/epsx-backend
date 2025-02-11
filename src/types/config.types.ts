export interface AppConfig {
  port: number;
  environment: string;
  apiKey?: string;
  logLevel?: string;
}

export interface DatabaseConfig {
  url: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface ScrapingConfig {
  navigationTimeout: number;
  retryAttempts: number;
  concurrentRequests: number;
  userAgent?: string;
}

// Configuration for different services and features
export interface ServiceConfig {
  app: AppConfig;
  database: DatabaseConfig;
  scraping: ScrapingConfig;
}

// TODO: Add configurations for:
// - Caching strategies
// - Rate limiting
// - API endpoints
// - Authentication methods
