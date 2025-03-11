import { Module } from '@nestjs/common';
import { BookLogController } from './book_log.controller';
import { BookLogService } from './book_log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booklog } from './book_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booklog])],
  controllers: [BookLogController],
  providers: [BookLogService]
})
export class BookLogModule { }
