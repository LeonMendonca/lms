import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookcount } from './bookcount.entity';
import { BookcountController } from './bookcount.controller';
import { BookcountService } from './bookcount.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookcount])],
  controllers: [BookcountController],
  providers: [BookcountService],
})
export class BookcountModule {}
