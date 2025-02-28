import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books/books.module';
import { Books } from './books/books.entity';
import { Booklog } from './books/booklog/book.log.entity';
import { BooklogModule } from './books/booklog/booklog.module';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, Booklog],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BooklogModule,
  ],
})
export class AppModule {
  constructor() {}
}
