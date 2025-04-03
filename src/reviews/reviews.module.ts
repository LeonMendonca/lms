import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from 'src/students/students.service';
import { Students } from 'src/students/students.entity';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Students])],
  controllers: [ReviewsController],
  providers: [ReviewsService, StudentsService, QueryBuilderService],
})
export class ReviewsModule {}
