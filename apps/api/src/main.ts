import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
		origin: [
			"http://localhost:4000"
		],
		credentials: true,
	});

  // Get ConfigService instance
  const configService = app.get(ConfigService);
  const authSecret = configService.get<string>('AUTH_SECRET');

  if (!authSecret) {
    throw new Error('AUTH_SECRET environment variable is not set');
  }

  // Enable cookie parser with signing secret
  app.use(cookieParser(authSecret));

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('QuizBuzz API')
    .setDescription('The QuizBuzz API documentation')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 OpenAPI documentation available at: http://localhost:${port}/openapi`);
}

bootstrap();
