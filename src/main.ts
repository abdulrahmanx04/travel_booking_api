import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TypOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { ThrottlerFilter } from './common/filters/ratelimit-exception.filter';
import helmet from 'helmet'
import { SwaggerModule,DocumentBuilder} from '@nestjs/swagger'

dotenv.config();
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
    const config= new DocumentBuilder()
        .setTitle('Travel booking API')
        .setDescription('API Documentaion for Travel booking')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document= SwaggerModule.createDocument(app,config)
    SwaggerModule.setup('api/docs',app,document)    

    

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
