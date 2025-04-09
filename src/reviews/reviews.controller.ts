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
import { TokenAuthGuard } from '../../utils/guards/token.guard';
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
  ) {}

  @Post()
  @UseGuards(TokenAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createReviewDto: TCreateReviewDTO,
  ): Promise<ApiResponse<Review>> {
    try {
      const { data } = await this.reviewsService.create(
        req.user.studentUuid,
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
  @UseGuards(TokenAuthGuard)
  async findAllStudent(
    @Request() req: AuthenticatedRequest,
    @Query('_book_uuid') book_uuid: string,
  ): Promise<ApiResponse<Review[]>> {
    try {
      const { data } = await this.reviewsService.findAllReviewsForStudent(
        req.user.studentUuid,
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
    @Query('_book_uuid') bookUuid: string,
  ): Promise<ApiResponse<Review[]>> {
    try {
      const { data } = await this.reviewsService.findAllAdmin(bookUuid);
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
    @Query('_review_uuid') reviewUuid: string,
  ): Promise<ApiResponse<Review>> {
    try {
      const { data } = await this.reviewsService.approveByAdmin(reviewUuid);
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
    @Query('_review_uuid') reviewUuid: string,
  ): Promise<ApiResponse<Review>> {
    try {
      const { data } = await this.reviewsService.rejectByAdmin(reviewUuid);
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
    @Param('review_uuid') reviewUuid: string,
    @Body() updateReviewDto: TUpdateReviewDTO,
  ): Promise<ApiResponse<Review>> {
    try {
      const review = await this.reviewsService.update(
        reviewUuid,
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
