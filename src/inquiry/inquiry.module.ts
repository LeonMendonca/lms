import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquireLogs } from './entities/inquire-logs';
import { StudentNotification } from 'src/student-notify/entities/student-notify.entity';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';

@Module({
  imports: [TypeOrmModule.forFeature([InquireLogs, StudentNotification])],
  controllers: [InquiryController],
  providers: [InquiryService, StudentNotifyService],
})
export class InquiryModule {}
