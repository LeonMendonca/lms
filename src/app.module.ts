import { Module } from '@nestjs/common';
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
import { BooksV2Module } from './books_v2/books_v2.module';
import { BookLogModule } from './book_log/book_log.module';
import { JournalsModule } from './journals/journals.module';
import { JournalCopy } from './journals/entity/journals_copy.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { TrialModule } from './trial/trial.module';
import { TrialTable } from './trial/entity/trial_table.entity';
import { TrialCopy } from './trial/entity/trial_copy.entity';
import { Booklog_v2 } from './books_v2/entity/book_logv2.entity';
import { BookTitle } from './books_v2/entity/books_v2.title.entity';
import { JournalTitle } from './journals/entity/journals_title.entity';
import { JournalLogs } from './journals/entity/journals_log.entity';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, Booklog, Booklog_v2, BookTitle, Bookcount, BookCopy, JournalLogs, JournalCopy, JournalTitle, TrialTable, TrialCopy],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BooklogModule,
    BookcountModule,
    BooksV2Module,
    BookLogModule,
    JournalsModule,
    NotificationsModule,
    TrialModule,
  ],
})
export class AppModule {
  constructor() { }
}
