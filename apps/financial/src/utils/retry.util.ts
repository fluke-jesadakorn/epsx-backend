import { logger } from './logger';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
};

/**
 * Decorator to retry method execution on failure
 * @param config - Retry configuration
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      let delay = finalConfig.initialDelay;

      for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          if (!shouldRetry(error, finalConfig.retryableErrors)) {
            throw error;
          }

          if (attempt === finalConfig.maxAttempts) {
            logger.error(
              `Failed after ${attempt} attempts. Last error: ${lastError.message}`,
              lastError.stack,
              propertyKey,
            );
            throw lastError;
          }

          logger.warn(
            `Attempt ${attempt} failed. Retrying in ${delay}ms...`,
            lastError.message,
            propertyKey,
          );

          if (finalConfig.onRetry) {
            finalConfig.onRetry(lastError, attempt);
          }

          await sleep(delay);
          delay = Math.min(delay * 2, finalConfig.maxDelay);
        }
      }

      throw lastError!;
    };

    return descriptor;
  };
}

/**
 * Check if an error should be retried based on configuration
 */
function shouldRetry(error: any, retryableErrors?: Array<string | RegExp>): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    return true;
  }

  const errorString = error instanceof Error ? error.message : String(error);

  return retryableErrors.some((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(errorString);
    }
    return errorString.includes(matcher);
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility functions for common retry scenarios
export const RetryUtils = {
  /**
   * Exponential backoff delay calculation
   */
  calculateBackoff(attempt: number, initialDelay: number, maxDelay: number): number {
    return Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
  },

  /**
   * Check if error is network related
   */
  isNetworkError(error: any): boolean {
    const networkErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EHOSTUNREACH',
      'EHOSTDOWN',
    ];
    
    return networkErrors.some(code => 
      error.code === code || error.message?.includes(code)
    );
  },

  /**
   * Check if error is related to rate limiting
   */
  isRateLimitError(error: any): boolean {
    return (
      error.status === 429 ||
      error.statusCode === 429 ||
      error.message?.toLowerCase().includes('rate limit') ||
      error.message?.toLowerCase().includes('too many requests')
    );
  },
};

// TODO: Add support for retry budgets
// TODO: Implement circuit breaker pattern
// TODO: Add support for retry events/callbacks
// TODO: Implement progressive delays
// TODO: Add support for retry quotas
// TODO: Implement request coalescing
// TODO: Add support for retry windows
// TODO: Implement retry metrics collection
// TODO: Add support for conditional retries
// TODO: Implement retry backoff strategies
