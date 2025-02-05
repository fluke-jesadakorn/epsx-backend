import * as dotenv from 'dotenv';
import { DatabaseConfig } from '../types';
import { getAppConfig, AppConfig } from './app.config';

// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: '.env',
  });
}

// Environment validation
function validateEnvironment(): void {
  if (!process.env.MONGODB_URL) {
    throw new Error(
      'Missing required environment variable: MONGODB_URL\n' +
        'For local development: Add MONGODB_URL to your .env file\n' +
        'For production: Configure MONGODB_URL in your environment',
    );
  }
}

// Validate environment before exporting configurations
validateEnvironment();

// Export app configuration
export const config = {
  app: getAppConfig(),
} as const;

// Type exports for configuration consumers
export type { DatabaseConfig } from '../types';
export type { AppConfig } from './app.config';

/**
 * TODO: Future enhancements:
 * Configuration Management:
 * - Add configuration validation using class-validator
 * - Implement environment-specific configs (dev, prod, test)
 * - Add support for config hot reloading in development
 * - Add secrets management using HashiCorp Vault or AWS Secrets Manager
 * - Implement config versioning for tracking changes
 * - Add comprehensive configuration documentation
 * - Add configuration schema validation using JSON Schema
 * - Add support for external config providers (AWS Parameter Store, etc)
 * - Add configuration change notifications for real-time updates
 * - Implement configuration caching for performance
 * - Add configuration migration tools for version upgrades
 */
