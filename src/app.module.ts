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
import { BookCopy } from './books_v2/entity/books_v2.copies.entity';
import { BookTitle } from './books_v2/entity/books_v2.title.entity';
import { BooksV2Module } from './books_v2/books_v2.module';
import { Booklog_v2 } from './books_v2/entity/book_logv2.entity';
import { VisitLog } from './books_v2/entity/visitlog.entity';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [
        Students,
        Books,
        Booklog,
        Bookcount,
        BookCopy,
        BookTitle,
        Booklog_v2,
        VisitLog
      ],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BooklogModule,
    BookcountModule,
    BooksV2Module,
  ],
})
export class AppModule {
  constructor() {}
}
