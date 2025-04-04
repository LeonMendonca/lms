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
import { Booklog_v2 } from './books_v2/entity/book_logv2.entity';
import { BookTitle } from './books_v2/entity/books_v2.title.entity';
import { JournalTitle } from './journals/entity/journals_title.entity';
import { JournalLogs } from './journals/entity/journals_log.entity';
import { CalendarModule } from './calendar/calendar.module';
import { Calendar } from './calendar/entity/calendar.entity';
import { VisitLog } from './students/visitlog.entity';
import { FeesPenaltiesModule } from './fees-penalties/fees-penalties.module';
import { FeesPenalties } from './fees-penalties/entity/fees-penalties.entity';
import { RequestBook } from './books_v2/entity/request-book.entity';
import { StudentsVisitKey } from './students/entities/student-visit-key';
import { CsvModule } from './csv/csv.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/entities/review.entity';
import { ConfigModule } from './config/config.module';
import { LibraryConfig } from './config/entity/library_config.entity';
import { InstituteConfig } from './config/entity/institute_config.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { Notes } from './notes/entities/notes.entity';
import { NotesModule } from './notes/notes.module';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [
        Students,
        User,
        BookCopy,
        BookTitle,
        Booklog_v2,
        VisitLog,
        FeesPenalties,
        RequestBook,
        BookCopy,
        BookTitle,
        Booklog_v2,
        StudentsVisitKey,
        Review,
        JournalLogs, JournalCopy, JournalTitle, Calendar, LibraryConfig, InstituteConfig],
        JournalLogs,
        JournalCopy,
        JournalTitle,
        Calendar,
        Notes,
      ],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksV2Module,
    BookLogModule,
    JournalsModule,
    NotificationsModule,
    CalendarModule,
    FeesPenaltiesModule,
    FeesPenalties,
    ConfigModule,
    CsvModule,
    ReviewsModule,
    UserModule,
    NotesModule
  ],
})
export class AppModule {
  constructor() {}
}
