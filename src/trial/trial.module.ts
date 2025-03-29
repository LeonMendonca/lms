import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';
import { TrialTable } from './entity/trial_table.entity';
import { TrialCopy } from './entity/trial_copy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrialTable, TrialCopy])],
  controllers: [TrialController],
  providers: [TrialService]
})
export class TrialModule { }
