import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeesPenaltiesService } from './fees-penalties.service';
import { TokenAuthGuard } from '../../utils/guards/token.guard';
import { StudentsService } from 'src/students/students.service';
import { Booklog_v2 } from 'src/books_v2/entity/book_logv2.entity';
import { TPayFeeDTO } from './dto/fees-paid.dto';
import { BooksV2Service } from 'src/books_v2/books_v2.service';
import { FeesPenalties } from './entity/fees-penalties.entity';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

@Controller('fees-penalties')
export class FeesPenaltiesController {
  constructor(
    private feesPenaltiesService: FeesPenaltiesService,
    private readonly bookV2Service: BooksV2Service,
    private readonly studentService: StudentsService,
  ) {}

  @Get('student')
  @UseGuards(TokenAuthGuard)
  async getStudentsFees(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<Booklog_v2[]>> {
    try {
      const { data } = await this.feesPenaltiesService.getStudentFee({
        studentUuid: req.user.studentUuid,
      });
      return {
        data,
        success: true,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Get('admin')
  async getStudentsAdminFees(
    @Query('_institute_uuid') instituteUuid: string,
  ): Promise<ApiResponse<Booklog_v2[]>> {
    try {
      const { data } = await this.feesPenaltiesService.getFullFeeList({
        instituteUuid: JSON.parse(instituteUuid || '[]'),
      });
      return {
        data,
        success: true,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Get('admin-paid')
  async getStudentsAdminPaidFees(
    @Query('_institute_uuid') instituteUuid: string,
  ): Promise<ApiResponse<FeesPenalties[]>> {
    try {
      const { data } = await this.feesPenaltiesService.getFullPaidFeeList({
        instituteUuid: JSON.parse(instituteUuid || '[]'),
      });
      return {
        data,
        success: true,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Get('student-paid')
  @UseGuards(TokenAuthGuard)
  async getStudentsPaidFees(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<FeesPenalties[]>> {
    try {
      const { data } = await this.feesPenaltiesService.getStudentPaidFee({
        studentUuid: req.user.studentUuid,
      });
      return {
        data,
        success: true,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Post()
  async payStudentFee(
    @Query('_book_log_id') booklogId: string,
    @Body() payStudentPayload: TPayFeeDTO,
  ) {
    try {
      const { data, meta } = await this.feesPenaltiesService.payStuentFee(
        booklogId,
        payStudentPayload,
      );
      const barcode = meta?.log?.newBookCopy?.barcode;
      const { data: student } = await this.studentService.findStudentByUuid(
        data.borrowerUuid,
      );

      await this.bookV2Service.bookActions(
        {
          barCode: student.barCode,
          barcode,
          action: 'returned',
        },
        '',
        'returned',
      );
      return {
        data,
        success: true,
        pagination: null,
      };
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
