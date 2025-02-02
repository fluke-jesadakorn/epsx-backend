import { ScrapingConfig, DatabaseConfig } from "../types";

import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

// Environment validation
function validateEnvironment(): DatabaseConfig {
  const POSTGRES_URL = process.env.POSTGRES_URL;

  if (!POSTGRES_URL) {
    throw new Error(
      `Missing required environment variable: POSTGRES_URL`
    );
  }

  return {
    url: POSTGRES_URL,
  };
}

export const SCRAPING_CONFIG: ScrapingConfig = {
  navigationTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  isHeadless: process.env.HEADLESS_MODE !== "false",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  debug:
    process.env.DEBUG_MODE === "true"
      ? {
          slowMo: parseInt(process.env.DEBUG_SLOW_MO || "100", 10),
          screenshotOnError: true,
          consoleDebug: true,
          devtools: true,
        }
      : undefined,
};

// TODO: Future enhancements:
// - Add configuration validation
// - Implement environment-specific configs (dev, prod, test)
// - Add support for config hot reloading
// - Add secrets management
// - Implement config versioning
// - Add configuration documentation
// - Add configuration schema validation
// - Add support for external config providers

export const getDatabaseConfig = (): DatabaseConfig => validateEnvironment();
