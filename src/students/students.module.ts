import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Students } from './students.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { StudentsData } from './entities/student.entity';
import { StudentsVisitKey } from './entities/student-visit-key';
import { VisitLog } from './entities/visitlog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Students,
      StudentsData,
      StudentsVisitKey,
      VisitLog
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, QueryBuilderService],
  exports: [StudentsService],
})
export class StudentsModule {}
