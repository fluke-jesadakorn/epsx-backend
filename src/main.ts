import 'reflect-metadata';

/**
 * TODO: Google Cloud Deployment
 * This application will be deployed to Google Cloud Platform.
 * Required steps for GCP deployment:
 * 1. Set up Google Cloud project and enable required APIs
 * 2. Configure Google Cloud Run or Google Kubernetes Engine (GKE)
 * 3. Set up Cloud Build for CI/CD
 * 4. Configure environment variables in Cloud Run/GKE
 * 5. Update deployment scripts for GCP
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = getAppConfig();

  // Enable validation and transformation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  // Configure CORS
  app.enableCors(config.cors);

  // Configure static assets
  app.useStaticAssets(config.staticAssets.path);

  // Configure Swagger
  const document = SwaggerModule.createDocument(app, config.swagger.config);
  SwaggerModule.setup(config.swagger.path, app, document);

  await app.listen(config.port, () => {
    console.log(`Server is running on ${config.port}`);
    console.log(`Swagger is running on http://localhost:${config.port}/${config.swagger.path}`);
  });
}

bootstrap();
