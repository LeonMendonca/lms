import { Module } from '@nestjs/common';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalCopy } from './entity/journals_copy.entity';
import { JournalLogs } from './entity/journals_log.entity';
import { JournalTitle } from './entity/journals_title.entity';
import { Students } from 'src/students/students.entity';
import { FeesPenalties } from 'src/fees-penalties/entity/fees-penalties.entity';
import { BookCopy } from 'src/books_v2/entity/books_v2.copies.entity';
import { Booklog } from 'src/book_log/book_log.entity';
import { BookTitle } from 'src/books_v2/entity/books_v2.title.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { BooksV2Module } from 'src/books_v2/books_v2.module';
import { BooksV2Service } from 'src/books_v2/books_v2.service';
import { InstituteConfig } from 'src/config/entity/institute_config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalLogs, JournalCopy, JournalTitle, Students, FeesPenalties, BookTitle, BookCopy, Booklog_v2, BooksV2Module, InstituteConfig])],
  controllers: [JournalsController],
  providers: [JournalsService]
})
export class JournalsModule { }
