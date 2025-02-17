import { Logger } from '@nestjs/common';

class FinancialLogger extends Logger {
  constructor(context: string = 'Financial') {
    super(context);
  }

  /**
   * Log informational messages
   * @param message - The message to log
   * @param context - Optional context to override default
   */
  info(message: string, context?: string): void {
    super.log(message, context);
  }

  /**
   * Log debug messages (more detailed than info)
   * @param message - The message to log
   * @param data - Optional data to include in debug output
   * @param context - Optional context to override default
   */
  debug(message: string, data?: any, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      super.debug(
        `${message}${data ? `\nData: ${JSON.stringify(data, null, 2)}` : ''}`,
        context,
      );
    }
  }

  /**
   * Log warning messages (potential issues)
   * @param message - The warning message
   * @param trace - Optional stack trace or error details
   * @param context - Optional context to override default
   */
  warn(message: string, trace?: string, context?: string): void {
    super.warn(message + (trace ? `\nTrace: ${trace}` : ''), context);
  }

  /**
   * Log error messages (actual issues)
   * @param message - The error message
   * @param trace - Optional stack trace
   * @param context - Optional context to override default
   */
  error(message: string | Error, trace?: string, context?: string): void {
    if (message instanceof Error) {
      super.error(message.message, message.stack, context);
    } else {
      super.error(message, trace, context);
    }
  }

  /**
   * Log verbose messages (detailed debugging)
   * @param message - The message to log
   * @param context - Optional context to override default
   */
  verbose(message: string, context?: string): void {
    if (process.env.LOG_LEVEL === 'verbose') {
      super.verbose(message, context);
    }
  }

  /**
   * Format object for logging
   * @param obj - Object to format
   * @returns Formatted string representation
   */
  private formatObject(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return '[Unserializable object]';
    }
  }
}

// Create singleton instance
export const logger = new FinancialLogger();

// TODO: Add support for log rotation
// TODO: Add support for different log formats
// TODO: Add support for log aggregation
// TODO: Implement log filtering
// TODO: Add support for custom log levels
// TODO: Implement log retention policies
// TODO: Add support for structured logging
// TODO: Implement log compression
// TODO: Add support for remote logging
// TODO: Implement log search capabilities
