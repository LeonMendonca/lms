import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Students } from './students.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Students])],
  controllers: [StudentsController],
  providers: [StudentsService, QueryBuilderService],
  exports: [StudentsService],
})
export class StudentsModule {}
