import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TCreateReviewDTO } from './dto/create-review.dto';
import { TUpdateReviewDTO } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

interface Data<T> {
  data: T;
  pagination: null;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(
    studentUuid: any,
    createReviewDto: TCreateReviewDTO,
  ): Promise<Data<Review>> {
    try {
      const review = this.reviewRepository.create({
        ...createReviewDto,
        studentUuid: studentUuid,
      });
      const result = await this.reviewRepository.save(review);
      return { data: result, pagination: null };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllReviewsForStudent(
    studentUuid: string,
    bookUuid: string,
  ): Promise<Data<Review[]>> {
    try {
      const data = await this.reviewRepository
        .createQueryBuilder('review')
        .where('review.bookUuid = :bookUuid', { bookUuid })
        .andWhere('review.isArchived = false')
        .andWhere(
          '(review.isApproved = true OR review.studentUuid = :studentUuid)',
          { studentUuid: studentUuid },
        )
        .getMany();

      return { data, pagination: null };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAdmin(bookUuid: string): Promise<Data<Review[]>> {
    try {
      const result = await this.reviewRepository.find({
        where: { bookUuid, isArchived: false },
      });
      return { data: result, pagination: null };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveByAdmin(reviewUuid: string): Promise<Data<Review>> {
    try {
      await this.reviewRepository.update({ reviewUuid }, { isApproved: true });
      const updated = await this.reviewRepository.findOneBy({ reviewUuid });
      if (!updated) {
        throw new HttpException(`Review Not updated`, HttpStatus.NOT_FOUND);
      }
      return { data: updated, pagination: null };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectByAdmin(reviewUuid: string): Promise<Data<Review>> {
    try {
      await this.reviewRepository.update({ reviewUuid }, { isArchived: true });
      const updated = await this.reviewRepository.findOneBy({ reviewUuid });
      if (!updated) {
        throw new HttpException(`Review Not updated`, HttpStatus.NOT_FOUND);
      }
      return { data: updated, pagination: null };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    reviewUuid: string,
    updateReviewDto: TUpdateReviewDTO,
  ): Promise<Data<Review>> {
    try {
      await this.reviewRepository.update(
        { reviewUuid, isArchived: false },
        updateReviewDto,
      );
      const updated = await this.reviewRepository.findOneBy({ reviewUuid });
      if (!updated) {
        throw new HttpException(
          'Review not found after update',
          HttpStatus.NOT_FOUND,
        );
      }

      return { data: updated, pagination: null };
    } catch (error) {
      throw error;
    }
  }
}
