import { Module } from '@nestjs/common';
import { JournalsController } from './journals.controller';
import { JournalsService } from './journals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalsTable } from './entity/journals_table.entity';
import { JournalsCopy } from './entity/journals_copy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalsTable, JournalsCopy])],
  controllers: [JournalsController],
  providers: [JournalsService]
})
export class JournalsModule { }
