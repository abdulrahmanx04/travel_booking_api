import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TypOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { ThrottlerFilter } from './common/filters/ratelimit-exception.filter';
import helmet from 'helmet'
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      rawBody: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    }))

    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new TypOrmExceptionFilter(),
      new ThrottlerFilter()
    )
    app.use(helmet())
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credential: true
    });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
