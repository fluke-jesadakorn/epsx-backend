import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class LoggingMicroservice {
  private readonly logger = new Logger(LoggingMicroservice.name);

  @MessagePattern('log')
  handleLog(@Payload() data: any) {
    const { level, message, context, trace } = data;

    // Format message if it's not a string
    const formattedMessage = typeof message === 'string' 
      ? message 
      : JSON.stringify(message, null, 2);

    switch (level) {
      case 'error':
        this.logger.error(formattedMessage, trace, context);
        break;
      case 'info':
        this.logger.log(formattedMessage, context);
        break;
      case 'debug':
        this.logger.debug(formattedMessage, context);
        break;
      default:
        this.logger.warn(`Unknown log level: ${level}`, context);
    }
  }

  /**
   * Helper method to handle errors consistently
   */
  handleError(error: Error | any, context?: string): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : new Error().stack;
    this.logger.error(errorMessage, errorStack, context);
    return error instanceof Error ? error : new Error(errorMessage);
  }

  // TODO: Future enhancements:
  // 1. Add log rotation - Implement file-based log rotation using winston
  // 2. Add log filtering - Add support for log level filtering
  // 3. Add log formatting options - Support multiple output formats (JSON, plain text)
  // 4. Add log persistence - Store logs in MongoDB/Elasticsearch
  // 5. Add log aggregation - Collect logs from multiple services
  // 6. Add log monitoring - Implement health checks and alerts
  // 7. Add log analytics - Add support for log analysis and visualization
  // 8. Add structured logging - Support for standardized log formats
  // 9. Add performance logging - Track application performance metrics
  // 10. Add audit logging - Track security and compliance events
}
