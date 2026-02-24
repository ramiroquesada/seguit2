import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// import * as morgan from 'morgan';


const morgan = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow any origin for development/local network access
      callback(null, true);
    },
    credentials: true,
  });


  app.use(morgan('dev'));


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Seguit 2.0 API running on http://localhost:${port}`);
}
bootstrap();
