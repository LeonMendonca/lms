import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { TCreateReviewDTO } from './dto/create-review.dto';
import { TUpdateReviewDTO } from './dto/update-review.dto';
import { StudentAuthGuard } from 'src/students/student.guard';
import { StudentsService } from 'src/students/students.service';
import { Review } from './entities/review.entity';

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly studentService: StudentsService,
  ) {}

  @Post()
  @UseGuards(StudentAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createReviewDto: TCreateReviewDTO,
  ): Promise<ApiResponse<Review>> {
    try {
      console.log(req.user);
      const student = await this.studentService.findStudentBy({
        student_id: req.user.student_id,
      });
      const { data } = await this.reviewsService.create(
        student,
        createReviewDto,
      );
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Get('student')
  @UseGuards(StudentAuthGuard)
  async findAllStudent(
    @Request() req: AuthenticatedRequest,
    @Query('_book_uuid') book_uuid: string,
  ): Promise<ApiResponse<Review[]>> {
    try {
      const student = await this.studentService.findStudentBy({student_id: req.user.student_id});
      const { data } = await this.reviewsService.findAllReviewsForStudent(
        student,
        book_uuid,
      );
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Get('admin')
  async findAllAdmin(
    @Query('_book_uuid') book_uuid: string,
  ): Promise<ApiResponse<Review[]>> {
    try {
      const { data } = await this.reviewsService.findAllAdmin(book_uuid);
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Patch()
  async approveReviews(
    @Query('_review_uuid') review_uuid: string,
  ): Promise<ApiResponse<Review>> {
    try {
      const { data } = await this.reviewsService.approveByAdmin(review_uuid);
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Delete()
  async deleteReviews(
    @Query('_review_uuid') review_uuid: string,
  ): Promise<ApiResponse<Review>> {
    try {
      const { data } = await this.reviewsService.rejectByAdmin(review_uuid);
      return {
        success: true,
        data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }

  @Patch(':review_uuid')
  async update(
    @Param('review_uuid') review_uuid: string,
    @Body() updateReviewDto: TUpdateReviewDTO,
  ): Promise<ApiResponse<Review>> {
    try {
      const review = await this.reviewsService.update(
        review_uuid,
        updateReviewDto,
      );
      return {
        success: true,
        data: review.data,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw error;
      }
    }
  }
}
