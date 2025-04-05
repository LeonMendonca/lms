import { Module } from '@nestjs/common';
import { StudentNotifyService } from './student-notify.service';
import { StudentNotifyController } from './student-notify.controller';
import { StudentNotification } from './entities/student-notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from 'src/students/students.service';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { Students } from 'src/students/students.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentNotification, Students])],
  controllers: [StudentNotifyController],
  providers: [StudentNotifyService, StudentsService, QueryBuilderService],
})
export class StudentNotifyModule {}
