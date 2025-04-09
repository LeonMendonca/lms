import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TUpdateInquiryDTO } from './dto/update-inquiry.dto';
import { TCreateInquiryDTO } from './dto/create-inquiry.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InquireLogs } from './entities/inquire-logs';
import { Repository } from 'typeorm';

export interface DataWithPagination<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Data<T> {
  data: T;
  pagination: null;
  meta?: any;
}

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(InquireLogs)
    private inquiryRepository: Repository<InquireLogs>,
  ) {}

  async create({
    studentUuid,
    inquiryReqUuid,
    inquiryType,
  }: TCreateInquiryDTO): Promise<Data<InquireLogs>> {
    try {
      const newInquiry = this.inquiryRepository.create({
        studentUuid,
        inquiryReqUuid,
        inquiryType,
      });
      const savedInquiry = await this.inquiryRepository.save(newInquiry);

      return {
        data: savedInquiry,
        pagination: null,
      };
    } catch (error) {
      throw new HttpException(
        `Error: ${error.message || error} while processing visit log entry.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStudentUuid({
    studentUuid,
    page,
    limit,
  }: {
    studentUuid: string;
    page: number;
    limit: number;
  }) {
    try {
      const [data, total] = await this.inquiryRepository.findAndCount({
        where: {
          studentUuid,
          isArchived: false,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (data.length === 0) {
        throw new HttpException(
          'No inquiry log data found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    try {
      const [data, total] = await this.inquiryRepository.findAndCount({
        where: {
          isArchived: false,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (data.length === 0) {
        throw new HttpException(
          'No inquiry log data found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async update({inquiryUuid, type}: TUpdateInquiryDTO) {
    try {
      const log = await this.inquiryRepository.findOne({
        where: { inquiryUuid },
      });
      if (!log) {
        throw new HttpException('Inquiry log not found', HttpStatus.NOT_FOUND);
      }
  
      if (type === 'approve') {
        log.isResolved = true;
      } else if (type === 'reject') {
        log.isArchived = true;
      }
      await this.inquiryRepository.save(log);

    return {
      data: { success: true },
      pagination: null,
      meta: {
        inquiryType: log.inquiryType,
        studentUuid: log.studentUuid,
      },
    };
    } catch (error) {
      throw error
    }
  }
}
