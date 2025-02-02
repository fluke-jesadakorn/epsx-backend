import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  constructor(context: string = 'Application') {
    super(context);
  }

  error(message: any, trace?: string | Error, context?: string): void {
    if (trace instanceof Error) {
      context = trace.name;
      trace = trace.stack;
    } else if (message instanceof Error) {
      trace = message.stack;
      message = message.message;
    }
    super.error(message, trace, context);
  }

  info(message: any, context?: string): void {
    if (typeof message === 'string') {
      super.log(message, context);
    } else {
      super.log(JSON.stringify(message, null, 2), context);
    }
  }

  debug(message: any, context?: string): void {
    if (typeof message === 'string') {
      super.debug(message, context);
    } else {
      super.debug(JSON.stringify(message, null, 2), context);
    }
  }

  // Helper method for handling errors consistently
  handleError(error: Error | any, context?: string): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : new Error().stack;
    this.error(errorMessage, errorStack, context);
    return error instanceof Error ? error : new Error(errorMessage);
  }

  // TODO: Future enhancements:
  // 1. Add log rotation
  // 2. Add log filtering
  // 3. Add log formatting options
  // 4. Add log persistence
  // 5. Add log aggregation
  // 6. Add log monitoring
  // 7. Add log analytics
  // 8. Add structured logging
  // 9. Add performance logging
  // 10. Add audit logging
}
