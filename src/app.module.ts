import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BookCopy } from './books_v2/entity/books_v2.copies.entity';
import { BooksV2Module } from './books_v2/books_v2.module';
import { JournalsModule } from './journals/journals.module';
import { JournalCopy } from './journals/entity/journals_copy.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Booklog_v2 } from './books_v2/entity/book_logv2.entity';
import { BookTitle } from './books_v2/entity/books_v2.title.entity';
import { JournalTitle } from './journals/entity/journals_title.entity';
import { JournalLogs } from './journals/entity/journals_log.entity';
import { VisitLog } from './students/entities/visitlog.entity';
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
import { UserModule } from './user/user.module';
import { UserPreference } from './user/entity/user-preference.entity';
import { Notes } from './notes/entities/notes.entity';
import { NotesModule } from './notes/notes.module';
import { StudentNotifyModule } from './student-notify/student-notify.module';
import { StudentNotification } from './student-notify/entities/student-notify.entity';
import { UserAccessToken } from './user/entity/user-access.entity';
import { StudentsData } from './students/entities/student.entity';
import { InquiryModule } from './inquiry/inquiry.module';
import { InquireLogs } from './inquiry/entities/inquire-logs';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [
        UserPreference,
        UserAccessToken,
        LibraryConfig,
        StudentsData,


        Students,
        BookCopy,
        BookTitle,
        VisitLog,
        // FeesPenalties,
        RequestBook,
        // BookCopy,
        // BookTitle,
        Booklog_v2,
        StudentsVisitKey,
        Review,
        // JournalLogs, 
        // JournalCopy, 
        // JournalTitle, 
        InstituteConfig,
        Notes,
        InquireLogs,
        StudentNotification,
      ],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksV2Module,
    // JournalsModule,
    NotificationsModule,
    // FeesPenaltiesModule,
    ConfigModule,
    CsvModule,
    ReviewsModule,
    UserModule,
    NotesModule,
    StudentNotifyModule,
    InquiryModule
  ],
})
export class AppModule {
  constructor() {}
}

