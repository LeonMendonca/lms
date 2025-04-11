import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquireLogs } from './entities/inquire-logs';

@Module({
  imports: [TypeOrmModule.forFeature([InquireLogs])],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}
