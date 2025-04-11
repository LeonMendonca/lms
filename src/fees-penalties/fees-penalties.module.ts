import { Module } from '@nestjs/common';
import { FeesPenaltiesController } from './fees-penalties.controller';
import { FeesPenaltiesService } from './fees-penalties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesPenalties } from './entity/fees-penalties.entity';
import { JournalCopy } from 'src/journals/entity/journals_copy.entity';
import { JournalTitle } from 'src/journals/entity/journals_title.entity';
import { JournalLogs } from 'src/journals/entity/journals_log.entity';
import { BookCopy } from 'src/books_v2/entity/books_v2.copies.entity';
import { BookTitle } from 'src/books_v2/entity/books_v2.title.entity';
import { Students } from 'src/students/students.entity';
import { StudentsService } from 'src/students/students.service';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentsData } from 'src/students/entities/student.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { LibraryConfig } from 'src/config/entity/library_config.entity';
import { VisitLog } from 'src/students/entities/visitlog.entity';
import { StudentsVisitKey } from 'src/students/entities/student-visit-key';
import { BooksV2Service } from 'src/books_v2/books_v2.service';
import { RequestBook } from 'src/books_v2/entity/request-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeesPenalties,
      JournalCopy,
      JournalTitle,
      JournalLogs,
      BookCopy,
      BookTitle,
      Students,
      StudentsData,
      Booklog_v2,
      LibraryConfig,
      VisitLog,
      StudentsVisitKey,
      RequestBook
    ]),
  ],
  controllers: [FeesPenaltiesController],
  providers: [FeesPenaltiesService, StudentsService, QueryBuilderService, BooksV2Service],
})
export class FeesPenaltiesModule {}
