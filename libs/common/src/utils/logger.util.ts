import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerUtil extends Logger {
  error(message: any, trace?: string, context?: string): void {
    // Add timestamp to error logs
    const timestamp = new Date().toISOString();
    super.error(`[${timestamp}] ${message}`, trace, context);
  }

  warn(message: any, context?: string): void {
    // Add timestamp to warning logs
    const timestamp = new Date().toISOString();
    super.warn(`[${timestamp}] ${message}`, context);
  }

  info(message: any, context?: string): void {
    // Add timestamp to info logs
    const timestamp = new Date().toISOString();
    super.log(`[${timestamp}] ${message}`, context);
  }

  debug(message: any, context?: string): void {
    // Add timestamp to debug logs
    const timestamp = new Date().toISOString();
    super.debug(`[${timestamp}] ${message}`, context);
  }

  verbose(message: any, context?: string): void {
    // Add timestamp to verbose logs
    const timestamp = new Date().toISOString();
    super.verbose(`[${timestamp}] ${message}`, context);
  }
}
