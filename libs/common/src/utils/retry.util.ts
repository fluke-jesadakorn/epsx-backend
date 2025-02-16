export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  retryableErrors?: (string | RegExp)[];
}

/**
 * Retry decorator for methods that may fail transiently
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 5000,
    retryableErrors = [],
  } = config;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      let delay = initialDelay;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          const isRetryable = retryableErrors.some((pattern) =>
            typeof pattern === 'string'
              ? error.name === pattern || error.message.includes(pattern)
              : pattern.test(error.message),
          );

          if (!isRetryable || attempt === maxAttempts) {
            throw error;
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, maxDelay);
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}
