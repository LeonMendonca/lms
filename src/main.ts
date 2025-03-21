import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { BookCopy } from "src/books_v2/entity/books_v2.copies.entity";
import { BookTitle } from "src/books_v2/entity/books_v2.title.entity";
import { Students } from "src/students/students.entity";
import { DataSource, Repository } from "typeorm";
import { config } from "dotenv";
import { dataSource } from './worker-threads/datasource-typeorm';
import { pgConnect } from './worker-threads/pg.connect';

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

pgConnect().then(() => {
  console.log("Connected to PG");
  bootstrap();
}).catch(error => console.error(error.message));