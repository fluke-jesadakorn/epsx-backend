import { NestFactory } from '@nestjs/core';
import { Logger, Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

@Catch()
class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('ErrorFilter');

  catch(error: Error, host: ArgumentsHost) {
    this.logger.error('Detailed error info:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: (error as any).cause,
      metadata: (error as any).metadata,
    });

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log request details for debugging
    this.logger.debug('Request details:', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      query: request.query,
    });

    // Handle validation errors (BadRequestException)
    if (error.name === 'BadRequestException') {
      const status = 400;
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: error.message,
        // If validation error contains constraints, include them
        errors: error['response']?.message || error.message,
      });
    }

    // Default error response for other types of errors
    const status = error['status'] || 500;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: error.message || 'Internal server error',
      path: request.url,
    });
  }
}

async function bootstrap() {
  const logger = new Logger('Gateway Service');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  const port = configService.get('PORT', 3001);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  const isDev = configService.get('NODE_ENV') === 'development';

  // Add global error handler
  app.useGlobalFilters(new ErrorFilter());

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS with specific configuration
  app.enableCors({});

  // Swagger documentation
  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('Gateway API')
      .setDescription('Gateway service API documentation')
      .setVersion('1.0')
      .addTag('Stocks', 'Stock market data and operations')
      .addTag('Stock Scraping', 'Stock data scraping operations')
      .addTag('Exchanges', 'Exchange market operations')
      .addTag('Financial', 'Financial data operations')
      .addTag('AI', 'AI-powered analysis')
      .addTag('Health', 'Service health checks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Start the application
  await app.listen(port);
  logger.log(
    `🚀 Gateway service is running on: http://localhost:${port}/${apiPrefix}`,
  );
  if (isDev) {
    logger.log(
      `📚 Swagger documentation available at: http://localhost:${port}/docs`,
    );
  }

  // Log configuration for debugging
  logger.debug('Gateway Service Configuration:', {
    port,
    apiPrefix,
    nodeEnv: isDev ? 'development' : 'production',
    corsEnabled: true,
    swaggerEnabled: isDev,
  });

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);
      await app.close();
      logger.log('Gateway service terminated gracefully');
      process.exit(0);
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('Gateway Service');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// TODO: Add prometheus metrics
// TODO: Add request logging middleware
// TODO: Add error tracking integration

bootstrap().catch((error) => {
  const logger = new Logger('Gateway Service');
  logger.error('Failed to start gateway service:', error);
  process.exit(1);
});
