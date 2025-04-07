import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Students } from './students.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { StudentNotification } from 'src/student-notify/entities/student-notify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Students, StudentNotification])],
  controllers: [StudentsController],
  providers: [StudentsService, QueryBuilderService, StudentNotifyService],
  exports: [StudentsService],
})
export class StudentsModule {}
