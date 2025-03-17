import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books/books.module';
import { Books } from './books/books.entity';
import { BookLogModule } from './book_log/book_log.module';
import { Booklog } from './book_log/book_log.entity';
import { JournalsModule } from './journals/journals.module';
import { JournalsTable } from './journals/entity/journals_table.entity';
import { JournalsCopy } from './journals/entity/journals_copy.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { TrialModule } from './trial/trial.module';
import { TrialTable } from './trial/entity/trial_table.entity';
import { TrialCopy } from './trial/entity/trial_copy.entity';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, Booklog, JournalsTable, JournalsCopy, TrialTable, TrialCopy],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BookLogModule,
    JournalsModule,
    NotificationsModule,
    TrialModule,
  ],
})
export class AppModule {
  constructor() { }
}
