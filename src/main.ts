import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Ensure uploads folder exists ──────────────────────────────
  const uploadsDir = join(process.cwd(), 'uploads', 'projects');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // ── Serve uploaded images as static files ─────────────────────
  // Access via: http://localhost:3001/uploads/projects/filename.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://my-portifolio-tau-eight.vercel.app',
      'https://jacobchidieugen.com',
    ],
    credentials: true,
  });

  // ── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // ── API prefix ────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger ───────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('JCE Blog API')
    .setDescription('Jacob Chidi Eugene — Blog Backend REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 JCE Blog API running on port ${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  console.log(`🖼️  Uploads served at http://localhost:${port}/uploads/`);
}
bootstrap();

