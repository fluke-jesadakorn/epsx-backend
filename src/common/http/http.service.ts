import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { getAppConfig } from '../../config/app.config';

// Future Features:
// 1. Add request queueing system for better rate limiting
// 2. Implement circuit breaker pattern for failing endpoints
// 3. Add request caching layer
// 4. Support different retry strategies per endpoint
// 5. Add metrics collection for request performance
// 6. Implement request priority system
// 7. Add support for different authentication methods
// 8. Implement request batching for similar endpoints

interface FetchConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  headers?: Record<string, string>;
}

@Injectable()
export class HttpService {
  private defaultConfig: FetchConfig;

  constructor() {
    const config = getAppConfig();
    this.defaultConfig = config.http;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Makes an HTTP request with built-in retry logic and exponential backoff
   */
  async fetch<T>(
    url: string,
    config: Partial<FetchConfig> = {},
    retryCount = 0,
  ): Promise<T | null> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      logger.info(`Fetching data from: ${url}`);
      
      const response = await axios.get(url, {
        timeout: finalConfig.timeout,
        headers: finalConfig.headers,
      });

      // Handle rate limiting
      if (response.status === 429 && retryCount < finalConfig.maxRetries) {
        const dynamicDelay = finalConfig.retryDelay * Math.pow(2, retryCount);
        logger.warn(`Rate limited, retrying in ${dynamicDelay}ms...`);
        await this.sleep(dynamicDelay);
        return this.fetch(url, config, retryCount + 1);
      }

      if (response.status < 200 || response.status >= 300) {
        logger.warn(`Failed to fetch data: ${response.statusText}`);
        return null;
      }

      return response.data;
    } catch (error) {
      const isAxiosError = axios.isAxiosError(error);
      const errorMessage = isAxiosError ? error.message : String(error);
      logger.error(`Error fetching data: ${errorMessage}`);

      if (retryCount < finalConfig.maxRetries) {
        const dynamicDelay = finalConfig.retryDelay * Math.pow(2, retryCount);
        logger.warn(`Retrying in ${dynamicDelay}ms (attempt ${retryCount + 1})...`);
        await this.sleep(dynamicDelay);
        return this.fetch(url, config, retryCount + 1);
      }

      return null;
    }
  }

  /**
   * Makes a request specifically to the Stock Analysis API
   */
  async fetchStockAnalysis<T>(endpoint: string, config: Partial<FetchConfig> = {}): Promise<T | null> {
    const url = `https://stockanalysis.com${endpoint}`;
    return this.fetch<T>(url, {
      ...config,
      headers: {
        ...config.headers,
        'X-Source': 'Cloudflare-Workers',
      },
    });
  }

  /**
   * Makes a request to the Stock Analysis Screener API
   */
  async fetchStockScreener<T>(
    market: string,
    config: Partial<FetchConfig> = {},
  ): Promise<T | null> {
    const endpoint = market === 'NASDAQ' ? 's' : 'a';
    const filterParam = market === 'NASDAQ' ? 'exchange' : 'exchangeCode';
    const url = `https://api.stockanalysis.com/api/screener/${endpoint}/f?m=marketCap&s=desc&c=s,n&f=${filterParam}-is-${market}`;
    
    return this.fetch<T>(url, config);
  }
}
