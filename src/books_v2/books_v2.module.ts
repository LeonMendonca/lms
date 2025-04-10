import { Module } from '@nestjs/common';
import { BooksV2Controller } from './books_v2.controller';
import { BooksV2Service } from './books_v2.service';
import { BookTitle } from './entity/books_v2.title.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopy } from './entity/books_v2.copies.entity';
import { Students } from 'src/students/students.entity';
import { Booklog_v2 } from './entity/book_logv2.entity';
import { FeesPenalties } from 'src/fees-penalties/entity/fees-penalties.entity';
import { RequestBook } from './entity/request-book.entity';
import { StudentsService } from 'src/students/students.service';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { StudentNotification } from 'src/student-notify/entities/student-notify.entity';
import { StudentsData } from 'src/students/entities/student.entity';
import { VisitLog } from 'src/students/entities/visitlog.entity';
import { StudentsVisitKey } from 'src/students/entities/student-visit-key';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookTitle,
      BookCopy,
      Students,
      Booklog_v2,
      FeesPenalties,
      RequestBook,
      StudentNotification,
      StudentsData,
      VisitLog,
      StudentsVisitKey
    ]),
  ],
  controllers: [BooksV2Controller],
  providers: [
    BooksV2Service,
    StudentsService,
    QueryBuilderService,
    StudentNotifyService,
  ],
})
export class BooksV2Module {}
