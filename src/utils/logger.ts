import { getAppConfig } from '../config/app.config';

const config = getAppConfig();
const resetColor = '[0m';

class Logger {
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private formatMessage(level: string, message: string | Error, context?: string): string {
    const timestamp = config.logger.timestamp ? `[${this.getTimestamp()}]` : '';
    const colorCode = config.logger.colors[level.toLowerCase()] || '';
    const formattedLevel = `[${level.toUpperCase()}]`;
    const contextStr = context ? `[${context}] ` : '';
    
    let formattedMessage: string;
    if (message instanceof Error) {
      formattedMessage = `${message.message}\n${message.stack}`;
    } else {
      formattedMessage = message;
    }
    
    return `${timestamp}${colorCode}${formattedLevel} ${contextStr}${formattedMessage}${resetColor}`;
  }

  error(message: string | Error, context?: string): void {
    console.error(this.formatMessage('error', message, context));
  }

  warn(message: string | Error, context?: string): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  info(message: string | Error, context?: string): void {
    console.info(this.formatMessage('info', message, context));
  }

  debug(message: string | Error, context?: string): void {
    if (config.logger.debug) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  log(message: string | Error, context?: string): void {
    this.info(message, context);
  }
}

export const logger = new Logger();

/**
 * TODO: Future enhancements:
 * - Add log rotation support
 * - Implement log file output
 * - Add log level filtering
 * - Support structured logging (JSON format)
 * - Add request ID tracking
 * - Implement log aggregation support
 * - Add performance metrics logging
 * - Support custom log formatters
 * - Add log compression
 * - Implement async logging
 */
