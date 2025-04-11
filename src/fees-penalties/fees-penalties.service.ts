import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { FeesPenalties } from './entity/fees-penalties.entity';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { TPayFeeDTO } from './dto/fees-paid.dto';

export interface Data<T> {
  data: T;
  pagination: null;
  meta?: any;
}

@Injectable()
export class FeesPenaltiesService {
  constructor(
    @InjectRepository(FeesPenalties)
    private feesPenaltiesRepository: Repository<FeesPenalties>,

    @InjectRepository(Booklog_v2)
    private bookLogPenalty: Repository<Booklog_v2>,
  ) {}

  async getStudentFee({
    studentUuid,
  }: {
    studentUuid: string;
  }): Promise<Data<Booklog_v2[]>> {
    try {
      const pendingPenalties = await this.bookLogPenalty.find({
        where: {
          borrowerUuid: studentUuid,
          action: 'borrowed',
          expectedDate: LessThan(new Date()),
          isReturned: false,
        },
      });

      return {
        data: pendingPenalties,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStudentPaidFee({
    studentUuid,
  }: {
    studentUuid: string;
  }): Promise<Data<FeesPenalties[]>> {
    try {
      const pendingPenalties = await this.feesPenaltiesRepository.find({
        where: {
          borrowerUuid: studentUuid,
        },
      });
      return {
        data: pendingPenalties,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFullFeeList({
    instituteUuid,
  }: {
    instituteUuid: string;
  }): Promise<Data<Booklog_v2[]>> {
    try {
      const pendingPenalties = await this.bookLogPenalty.find({
        where: {
          instituteUuid: instituteUuid,
          action: 'borrowed',
          expectedDate: LessThan(new Date()),
          isReturned: false,
        },
      });

      return {
        data: pendingPenalties,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFullPaidFeeList({
    instituteUuid,
  }: {
    instituteUuid: string;
  }): Promise<Data<FeesPenalties[]>> {
    try {
      const pendingPenalties = await this.feesPenaltiesRepository.find({
        where: {
          instituteUuid: instituteUuid,
        },
      });

      return {
        data: pendingPenalties,
        pagination: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async payStuentFee(
    booklogId: string,
    payStudentPayload: TPayFeeDTO,
  ): Promise<Data<FeesPenalties>> {
    try {
      const log = await this.bookLogPenalty.findOne({
        where: {
          booklogId: booklogId,
          isReturned: false,
        },
      });
      if (!log) {
        throw new HttpException(
          'Penalty might already have been paid',
          HttpStatus.FORBIDDEN,
        );
      }
      const payPenalty = this.feesPenaltiesRepository.create({
        ...payStudentPayload,
        bookCopyUuid: log.bookCopyUuid,
        borrowerUuid: log.borrowerUuid,
        bookLogData: log,
      });
      const savePaidPenalty =
        await this.feesPenaltiesRepository.save(payPenalty);
      return {
        data: payPenalty,
        pagination: null,
        meta: { log },
      };
    } catch (error) {
      throw error;
    }
  }

}
