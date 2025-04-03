import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TCreateReviewDTO } from './dto/create-review.dto';
import { TUpdateReviewDTO } from './dto/update-review.dto';
import {
  insertQueryHelper,
  updateQueryHelper,
} from 'src/misc/custom-query-helper';
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
    user: any,
    createReviewDto: TCreateReviewDTO,
  ): Promise<Data<Review>> {
    try {
      let queryData = insertQueryHelper(
        { ...createReviewDto, student_uuid: user.student_uuid },
        [],
      );
      const result: Review[] = await this.reviewRepository.query(
        `
      INSERT INTO reviews (${queryData.queryCol}) values (${queryData.queryArg}) RETURNING *`,
        queryData.values,
      );
      return { data: result[0], pagination: null };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllReviewsForStudent(
    user: any,
    book_uuid: string,
  ): Promise<Data<Review[]>> {
    try {
      const data: Review[] = await this.reviewRepository.query(
        `SELECT * FROM reviews WHERE book_uuid = $1 AND is_archived = false AND (is_approved = true OR student_uuid = $2)`,
        [book_uuid, user.student_uuid],
      );
      return {
        data,
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllAdmin(book_uuid: string): Promise<Data<Review[]>> {
    try {
      const result: Review[] = await this.reviewRepository.query(
        `SELECT * FROM reviews WHERE book_uuid = $1 AND is_archived = false`,
        [book_uuid],
      );
      return {
        data: result,
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveByAdmin(review_uuid: string): Promise<Data<Review>> {
    try {
      const result: Review[] = await this.reviewRepository.query(
        `UPDATE reviews SET is_approved = true WHERE review_uuid = $1 RETURNING *`,
        [review_uuid],
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectByAdmin(review_uuid: string): Promise<Data<Review>> {
    try {
      const result: Review[] = await this.reviewRepository.query(
        `UPDATE reviews SET is_archived = true WHERE review_uuid = $1 RETURNING *`,
        [review_uuid],
      );
      return {
        data: result[0],
        pagination: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message || error} while creating student.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    review_uuid: string,
    updateReviewDto: TUpdateReviewDTO,
  ): Promise<Data<Review>> {
    try {
      let queryData = updateQueryHelper<TUpdateReviewDTO>(updateReviewDto, []);
      console.log(queryData)
      const result: Review[] = await this.reviewRepository.query(
        `UPDATE reviews SET ${queryData.queryCol} WHERE review_uuid = $${queryData.values.length + 1} AND is_archived = false RETURNING *`,
        [...queryData.values, review_uuid],
      );
      if (!result.length) {
        throw new HttpException(
          'Student not found after update',
          HttpStatus.NOT_FOUND,
        );
      }
      return { data: result[0], pagination: null };
    } catch (error) {
      throw error;
    }
  }
}
