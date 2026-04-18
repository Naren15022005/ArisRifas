import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const publicRoot = join(process.cwd(), 'public');
  app.useStaticAssets(publicRoot);

  // If an upload is requested but the file is missing, return a small SVG placeholder
  app.use('/uploads', (req, res, next) => {
    try {
      const requested = decodeURIComponent((req.path || '').toString()).replace(/^\//, '');
      const filePath = join(process.cwd(), 'public', 'uploads', requested);
      if (fs.existsSync(filePath)) {
        return next();
      }
    } catch (e) {
      // ignore and fallthrough to placeholder
    }
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#111"/><text x="50%" y="50%" fill="#ddd" font-family="Arial, Helvetica, sans-serif" font-size="28" dominant-baseline="middle" text-anchor="middle">Imagen no disponible</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
  });

  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  const defaultOrigins = 'https://arisrifas.vercel.app,https://arisrifas.onrender.com';
  const originsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || defaultOrigins;
  const allowedOrigins = originsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isDev = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDev
      ? true
      : (origin: string | undefined, callback: Function) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          return callback(null, false);
        },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'idempotency-key', 'x-requested-with'],
    maxAge: 600,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`Server listening on ${host}:${port}`);
}

void bootstrap();
