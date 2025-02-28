import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booklog } from './book.log.entity';
import { BooklogService } from './booklog.service';
import { BooklogController } from './booklog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booklog])],
  controllers: [BooklogController],
  providers: [BooklogService],
})
export class BooklogModule {}
