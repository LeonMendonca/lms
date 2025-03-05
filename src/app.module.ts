import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books/books.module';
import { Books } from './books/books.entity';
import { BookMini } from './books/book-mini/bookm.entity';
import { BookMiniModule } from './books/book-mini/bookm.module';
import { BooksV2Module } from './books_v2/books_v2.module';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, BookMini],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BookMiniModule,
    BooksV2Module
  ],
})
export class AppModule {
  constructor() {}
}
