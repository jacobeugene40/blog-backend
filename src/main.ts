import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

// Known social crawler user-agent substrings
const CRAWLER_UAS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Slackbot',
  'redditbot',
  'Pinterest',
  'Googlebot',
];

function isCrawler(ua: string = ''): boolean {
  return CRAWLER_UAS.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Ensure uploads folder exists ──────────────────────────────
  const uploadsDir = join(process.cwd(), 'uploads', 'projects');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // ── Serve uploaded images as static files ─────────────────────
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: function (origin, callback) {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3002',
        'https://jacobchidieugen.com',
        'https://jacob-chidi-eugene.vercel.app',  // ← removed trailing slash
      ];
      // Allow:
      // 1. No origin (server-to-server, curl, social crawlers)
      // 2. Explicitly allowed origins
      // 3. Any *.vercel.app subdomain (preview deployments)
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // ── Allow social crawlers through on /og routes ───────────────
  // @Res() bypasses NestJS CORS — this middleware handles crawlers explicitly
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, res: any, next: any) => {
    const ua = req.headers['user-agent'] || '';
    if (req.path.endsWith('/og') && isCrawler(ua)) {
      // Explicitly allow crawler — set CORS headers manually
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Robots-Tag', 'index, follow');
    }
    next();
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