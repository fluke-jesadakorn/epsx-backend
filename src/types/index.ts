export interface ScrapingConfig {
  navigationTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  isHeadless: boolean;
  userAgent: string;
  debug?: {
    slowMo: number;
    screenshotOnError: boolean;
    consoleDebug: boolean;
    devtools: boolean;
  };
}

export interface DatabaseConfig {
  url: string;
}

export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error: Error | null): void;
  debug(message: string, ...args: any[]): void;
}

export interface Exchange {
  id: string;
  market_code: string;
  name: string;
  country: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationParams {
  limit?: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    limit: number;
    skip: number;
  };
}
