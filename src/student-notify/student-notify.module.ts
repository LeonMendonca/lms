import { Module } from '@nestjs/common';
import { StudentNotifyService } from './student-notify.service';
import { StudentNotifyController } from './student-notify.controller';
import { StudentNotification } from './entities/student-notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StudentNotification])],
  controllers: [StudentNotifyController],
  providers: [StudentNotifyService,],
})
export class StudentNotifyModule {}
