import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { retryAttempts: 5, retryDelay: 3000 },
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Investing Scrape Data API')
    .setDescription(
      'API documentation for the Investing Scrape Data application',
    )
    .setVersion('1.0')
    .addTag('investing')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // await app.startAllMicroservices();
  await app.listen(port, () =>
    console.log(`Server is running on port ${port}`),
  );

  console.log(`Swagger is running on http://localhost:${port}/docs`);
}

bootstrap();
