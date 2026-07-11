import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: env.CORS_ORIGIN, credentials: true });
  app.enableShutdownHooks();

  // Imágenes subidas: servidas fuera del prefijo /api en el MVP (en prod las
  // sirve un CDN/bucket y este bloque se retira).
  app.useStaticAssets(join(process.cwd(), env.UPLOAD_DIR), { prefix: '/uploads' });

  await app.listen(env.PORT);
  console.log(`API escuchando en http://localhost:${env.PORT}/api`);
}

void bootstrap();
