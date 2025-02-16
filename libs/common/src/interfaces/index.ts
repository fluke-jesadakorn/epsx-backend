// Common interfaces shared across modules
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  info?: {
    [key: string]: {
      status: string;
    };
  };
  error?: {
    [key: string]: {
      status: string;
      message: string;
    };
  };
  details?: {
    [key: string]: {
      status: string;
      message?: string;
    };
  };
}

export interface ServiceRegistryEntry {
  name: string;
  url: string;
  status: 'UP' | 'DOWN';
  lastChecked: Date;
}

export interface DatabaseConfig {
  uri: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    [key: string]: any;
  };
}

export interface AppConfig {
  port: number;
  environment: string;
  version: string;
  api: {
    prefix: string;
    timeout: number;
    retries: number;
  };
  services: {
    [key: string]: {
      url: string;
      timeout?: number;
    };
  };
}

// TODO: Future enhancements
// - Add rate limiting configuration
// - Add caching configuration
// - Add authentication configuration
// - Add logging configuration
// - Add monitoring configuration
