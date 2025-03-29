import { Module } from '@nestjs/common';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalCopy } from './entity/journals_copy.entity';
import { JournalLogs } from './entity/journals_log.entity';
import { JournalTitle } from './entity/journals_title.entity';
import { Students } from 'src/students/students.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalLogs, JournalCopy, JournalTitle, Students])],
  controllers: [JournalsController],
  providers: [JournalsService]
})
export class JournalsModule { }
