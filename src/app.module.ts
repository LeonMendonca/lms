import { Module } from '@nestjs/common';
//import { BooksModule } from './books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { Students } from './students/students.entity';
import { StudentsModule } from './students/students.module';
import { BooksModule } from './books-typeorm/books.module';
import { Books } from './books-typeorm/books.entity';

config({ path: '.env' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      entities: [Students, Books],
      ssl: true,
      synchronize: true,
    }),
    StudentsModule,
    BooksModule,
  ],
})
export class AppModule {
  constructor() {}
}
