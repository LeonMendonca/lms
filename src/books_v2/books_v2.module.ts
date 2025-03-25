import { Module } from '@nestjs/common';
import { BooksV2Controller } from './books_v2.controller';
import { BooksV2Service } from './books_v2.service';
import { BookTitle } from './entity/books_v2.title.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { Students } from 'src/students/students.entity';
import { Booklog_v2 } from './entity/book_logv2.entity';
import { FeesPenalties } from 'src/fees-penalties/fees-penalties.entity';
import { RequestBook } from './entity/request-book.entity';
@Module({
  imports: [TypeOrmModule.forFeature([BookTitle, BookCopy, Students, Booklog_v2, FeesPenalties, RequestBook])],
  controllers: [BooksV2Controller],
  providers: [BooksV2Service],
})
export class BooksV2Module {}
