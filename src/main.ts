import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AuthGuard } from './common/guards/auth.guard';
import { PrismaService } from './prisma/prisma.service';
import { ValidateException } from './common/exceptions/validate.exception';

const privateKeyPath = join(process.cwd(), 'ssl', 'privatekey.key');
const certificatePath = join(process.cwd(), 'ssl', 'certificate.crt');

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(privateKeyPath, 'utf-8'),
    cert: readFileSync(certificatePath, 'utf-8'),
  };

  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidateException(
          validationErrors.map((error) =>
            Object.values(error.constraints ?? {}).join(', '),
          ),
        );
      },
    }),
  );

  app.useGlobalGuards(new AuthGuard(app.get(PrismaService)));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
