import fs from 'fs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AuthGuard } from './common/guards/auth.guard';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('../ssl/privatekey.key'),
    cert: fs.readFileSync('../ssl/certificate.crt'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalGuards(new AuthGuard(app.get(PrismaService)));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
