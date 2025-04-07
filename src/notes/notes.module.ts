import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Notes } from './entities/notes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from 'src/students/students.service';
import { Students } from 'src/students/students.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { StudentNotification } from 'src/student-notify/entities/student-notify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notes, Students, StudentNotification])],
  controllers: [NotesController],
  providers: [NotesService, StudentsService, QueryBuilderService, StudentNotifyService],
})
export class NotesModule {}
