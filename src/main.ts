import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { getAppConfig } from './config/app.config';
import { HealthCheckService } from './modules/health-check/health-check.service';

/**
 * Future improvements:
 * TODO: Add monitoring and metrics collection
 *  - Request/response metrics
 *  - Performance monitoring
 *  - Error tracking
 *  - Resource utilization metrics
 *  - Custom business metrics
 * 
 * TODO: Add observability features
 *  - Distributed tracing
 *  - Detailed logging
 *  - Performance profiling
 *  - Alert system integration
 */
async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');
    logger.log('Starting application...');

    // Create application instance
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const config = getAppConfig();

    // Perform pre-startup health checks
    logger.log('Performing health checks...');
    const healthCheckService = app.get(HealthCheckService);
    await healthCheckService.validateStartup();
    logger.log('Health checks passed successfully');

    // Enable validation and transformation
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    // Configure CORS
    app.enableCors(config.cors);

    // Configure static assets
    app.useStaticAssets(config.staticAssets.path);

    // Configure Swagger
    const document = SwaggerModule.createDocument(app, config.swagger.config);
    SwaggerModule.setup(config.swagger.path, app, document);

    await app.listen(config.port, () => {
      console.log(`Server is running on ${config.port}`);
      console.log(
        `Swagger is running on http://localhost:${config.port}/${config.swagger.path}`,
      );
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();
