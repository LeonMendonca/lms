import { Module } from '@nestjs/common';
import { StudentNotifyService } from './student-notify.service';
import { StudentNotifyController } from './student-notify.controller';
import { StudentNotification } from './entities/student-notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentNotification, Booklog_v2])],
  controllers: [StudentNotifyController],
  providers: [StudentNotifyService],
})
export class StudentNotifyModule {}
