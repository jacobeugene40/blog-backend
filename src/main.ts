import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';

const CRAWLER_UAS = [
  'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'slackbot', 'redditbot', 'pinterest',
  'googlebot', 'bingbot', 'applebot', 'discordbot', 'skypeuripreview',
];

function isCrawler(ua: string = ''): boolean {
  const lower = ua.toLowerCase();
  return CRAWLER_UAS.some(bot => lower.includes(bot));
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Ensure uploads folder exists ──────────────────────────────
  const uploadsDir = join(process.cwd(), 'uploads', 'projects');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // ── Serve uploaded images as static files ─────────────────────
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── Crawler bypass — runs BEFORE NestJS guards ────────────────
  // Social crawlers have no origin and get blocked by throttler.
  // This middleware intercepts /og requests from known bots and
  // serves the OG HTML directly, bypassing the NestJS pipeline.
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use((req: any, res: any, next: any) => {
    const ua = req.headers['user-agent'] || '';

    if (req.path.includes('/og') && isCrawler(ua)) {
      // Allow CORS for crawlers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Robots-Tag', 'index, follow');
    }
    next();
  });

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: function (origin, callback) {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3002',
        'https://jacobchidieugen.com',
        'https://jacob-chidi-eugene.vercel.app',
      ];
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