import { Logger } from '../types';
import { LogsGateway } from '../gateway/logs.gateway';

let logsGateway: LogsGateway | null = null;

export const setLogsGateway = (gateway: LogsGateway) => {
  logsGateway = gateway;
};

// TODO: Future enhancements:
// - Add log levels configuration
// - Implement log rotation
// - Add log formatting options
// - Add log transport abstraction
// - Add log aggregation support
// - Implement structured logging
// - Add log persistence
// - Add log filtering capabilities

class WebSocketLogger implements Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string): string {
    return `[${this.getTimestamp()}] [${level}] ${message}`;
  }

  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message), ...args);
    if (logsGateway) {
      logsGateway.broadcastLog({
        type: 'info',
        data: { message, args }
      });
    }
  }

  error(message: string, error: Error | null): void {
    const errorData = error ? { name: error.name, message: error.message, stack: error.stack } : {};
    console.error(this.formatMessage('ERROR', message), errorData);
    if (logsGateway) {
      logsGateway.broadcastLog({
        type: 'error',
        data: { message, error: errorData }
      });
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message), ...args);
    if (logsGateway) {
      logsGateway.broadcastLog({
        type: 'warn',
        data: { message, args }
      });
    }
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG === 'true') {
      console.debug(this.formatMessage('DEBUG', message), ...args);
      if (logsGateway) {
        logsGateway.broadcastLog({
          type: 'debug',
          data: { message, args }
        });
      }
    }
  }
}

// Export a singleton instance
export const logger = new WebSocketLogger();

// Export utility functions for error handling
export const handleError = (error: unknown, context: string): Error => {
  if (error instanceof Error) {
    logger.error(`Error in ${context}:`, error);
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const errorDetails = JSON.stringify(error, null, 2);
    const wrappedError = new Error(`Unknown error in ${context}: ${errorDetails}`);
    logger.error(`Error in ${context}:`, wrappedError);
    return wrappedError;
  }
  const wrappedError = new Error(`Unknown error in ${context}: ${String(error)}`);
  logger.error(`Error in ${context}:`, wrappedError);
  return wrappedError;
};
