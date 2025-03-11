import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
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

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Students, Books, Booklog, JournalsTable, JournalsCopy],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
    BookLogModule,
    JournalsModule,
  ],
})
export class AppModule {
  constructor() { }
}
