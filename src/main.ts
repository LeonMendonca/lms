import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { config } from "dotenv";

config({ path: '.env' })
const PORT = process.env.PORT ?? 3001;

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on port ${PORT}`);
  });
}

bootstrap();
