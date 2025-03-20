import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalCopy } from 'src/journals/entity/journals_copy.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { JournalLogs } from 'src/journals/entity/journals_log.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([JournalLogs, JournalCopy, Booklog_v2])],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule { }
