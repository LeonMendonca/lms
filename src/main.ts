import 'reflect-metadata'; // Add this at the top
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { pgPLV8 } from './misc/pg-plv8';
import * as bodyParser from 'body-parser';

export async function bootstrap() {
  config({ path: '.env' });
  const PORT = process.env.PORT ?? 3001;

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(bodyParser.json({ limit: '50mb' })); // adjust limit as needed
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // await pgPLV8();

  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on port ${PORT}`);
  });
}

bootstrap();