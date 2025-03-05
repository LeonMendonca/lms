import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books/books.module';
import { Books } from './books/books.entity';
import { Booklog } from './book_log/book_log.entity';
import { BooklogModule } from './book_log/booklog.module';
import { Bookcount } from './bookcount/bookcount.entity';
import { BookcountModule } from './bookcount/bookcount.module';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books,Booklog,Bookcount],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BooklogModule,
    BookcountModule
  ],
})
export class AppModule {
  constructor() {}
}
