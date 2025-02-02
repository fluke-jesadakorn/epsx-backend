export interface InvestmentData {
  id: number;
  symbol: string;
  price: number;
  timestamp: string;
  metadata?: {
    exchange?: string;
    sector?: string;
    industry?: string;
    marketCap?: number;
    pe?: number;
    peg?: number;
    priceChange?: number;
    name?: string;
    uid?: string;
    pairID?: string;
    path?: string;
    logo?: string | null;
    logoDark?: string | null;
  };
}

export interface Exchange {
  id?: number;
  exchange_name: string;
  exchange_url: string;
  country: string;
  market_code: string;
  currency: string;
  stocks: string;
  created_at?: string;
  updated_at?: string;
}

export interface Stock {
  id?: number;
  symbol: string;
  company_name: string;  // Changed to match database column name
  exchange_id: number;   // Added foreign key reference
  created_at?: string;
  updated_at?: string;
}

export interface StockScreenerQuery {
  filters: any[];
  sort: {
    metric: string;
    direction: string;
  };
  prefilters: {
    market: string;
    primaryOnly: boolean;
  };
}

export interface StockScreenerConfig {
  endpoint: string;
  headers: Record<string, string>;
  metrics: string[];
}

export interface DebugOptions {
  /**
   * Slows down Playwright operations by the specified number of milliseconds
   * Useful for watching browser interactions during debugging
   */
  slowMo?: number;
  /**
   * Whether to capture screenshots on errors
   * Screenshots will be saved in the debug/screenshots directory
   */
  screenshotOnError?: boolean;
  /**
   * Whether to enable verbose browser console logging
   */
  consoleDebug?: boolean;
  /**
   * Whether to show the browser DevTools panel
   * Only works when isHeadless is false
   */
  devtools?: boolean;
}

export interface ScrapingConfig {
  navigationTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  isHeadless?: boolean;
  userAgent?: string;
  /**
   * Debug mode configuration
   * These options are used when DEBUG_MODE is enabled
   */
  debug?: DebugOptions;
}

export interface DatabaseConfig {
  url: string;
}

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, error: Error) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

// TODO: Future enhancements:
// - Add validation schemas for each interface
// - Add support for different asset types (stocks, crypto, forex)
// - Add schema versioning for data evolution
// - Add type guards and type predicates
// - Add branded types for better type safety
// - Add readonly modifiers where appropriate
// - Add utility types for common operations
// - Add foreign key constraints validation functions
// - Add cascade delete handling for related records
