import { RetryConfig, RetryResult } from '../types/common.types';

export { RetryConfig, RetryResult };

/**
 * Generic retry decorator for async functions
 */
export function Retry(config: Partial<RetryConfig>) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const retryConfig: RetryConfig = {
        maxAttempts: config.maxAttempts || 3,
        delayMs: config.delayMs || 1000,
        backoff: config.backoff || true,
      };

      let lastError: Error | undefined;
      let attempts = 0;

      while (attempts < retryConfig.maxAttempts) {
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error: any) {
          lastError = error;
          attempts++;

          if (attempts === retryConfig.maxAttempts) {
            break;
          }

          const delay = retryConfig.backoff
            ? retryConfig.delayMs * Math.pow(2, attempts - 1)
            : retryConfig.delayMs;

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw lastError || new Error('Max retry attempts reached');
    };

    return descriptor;
  };
}

// TODO: Add retry strategies (exponential, linear, custom)
// TODO: Add retry condition callbacks
// TODO: Add retry event listeners
// TODO: Add timeout support
// TODO: Add circuit breaker integration
