import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books/books.module';
import { Books } from './books/books.entity';
import { BooksV2Module } from './books_v2/books_v2.module';
import { BookTitle } from './books_v2/entity/books_v2.title.entity';
import { BookCopy } from './books_v2/entity/books_v2.copies.entity';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, BookTitle, BookCopy],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BooksV2Module,
  ],
})
export class AppModule {
  constructor() {}
}
