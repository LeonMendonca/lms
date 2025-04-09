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
import { Booklog } from 'src/book_log/book_log.entity';
import { Students } from 'src/students/students.entity';
import { StudentsService } from 'src/students/students.service';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentsData } from 'src/students/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeesPenalties, JournalCopy, JournalTitle, JournalLogs, BookCopy, BookTitle, Booklog, Students, StudentsData])],
  controllers: [FeesPenaltiesController],
  providers: [FeesPenaltiesService, StudentsService, QueryBuilderService]
})
export class FeesPenaltiesModule { }
