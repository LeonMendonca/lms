import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { JournalsTable } from 'src/journals/entity/journals_table.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([JournalsTable])],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule { }
