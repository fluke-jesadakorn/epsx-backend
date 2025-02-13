import { Inject, Injectable, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerUtil {
  constructor(
    @Inject('LOGGING_SERVICE') private readonly loggingClient: ClientProxy,
    private readonly context: string = 'Application'
  ) {}

  error(message: any, trace?: string | Error, context: string = this.context): void {
    if (trace instanceof Error) {
      context = trace.name;
      trace = trace.stack;
    } else if (message instanceof Error) {
      trace = message.stack;
      message = message.message;
    }
    this.loggingClient.emit('log', { level: 'error', message, trace, context });
  }

  info(message: any, context: string = this.context): void {
    this.loggingClient.emit('log', { level: 'info', message, context });
  }

  debug(message: any, context: string = this.context): void {
    this.loggingClient.emit('log', { level: 'debug', message, context });
  }

  handleError(error: Error | any, context: string = this.context): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : new Error().stack;
    this.error(errorMessage, errorStack, context);
    return error instanceof Error ? error : new Error(errorMessage);
  }
}
