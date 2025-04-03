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
import { VisitLog } from './students/visitlog.entity';
import { FeesPenaltiesModule } from './fees-penalties/fees-penalties.module';
import { FeesPenalties } from './fees-penalties/fees-penalties.entity';
import { RequestBook } from './books_v2/entity/request-book.entity';
import { StudentsVisitKey } from './students/entities/student-visit-key';
import { CsvModule } from './csv/csv.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/entities/review.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';

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
        StudentsVisitKey,
        Review
      ],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksV2Module,
    FeesPenaltiesModule,
    CsvModule,
    ReviewsModule,
    UserModule
  ],
})
export class AppModule {
  constructor() {}
}
