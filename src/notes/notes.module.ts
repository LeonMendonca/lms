import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Notes } from './entities/notes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { StudentNotification } from 'src/student-notify/entities/student-notify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notes, StudentNotification])],
  controllers: [NotesController],
  providers: [NotesService, StudentNotifyService],
})
export class NotesModule {}
