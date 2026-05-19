import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use((helmet as any).default());

  // CORS — allow frontend dev server
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe — reject unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`[AgentBackend] Server running on http://localhost:${port}/api/v1`);
}
bootstrap();
