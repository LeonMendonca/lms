import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpException,
  HttpStatus,
  Request,
  Query,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { TCreateInquiryDTO } from './dto/create-inquiry.dto';
import { TUpdateInquiryDTO } from './dto/update-inquiry.dto';
import { TokenAuthGuard } from 'utils/guards/token.guard';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { InquireLogs } from './entities/inquire-logs';
import { NotificationType } from 'src/student-notify/entities/student-notify.entity';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: any;
  pagination: {} | null;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

@Controller('inquiry')
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly notifyService: StudentNotifyService,
  ) {}

  @Post()
  @UseGuards(TokenAuthGuard)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() { inquiryType, inquiryReqUuid }: TCreateInquiryDTO,
  ): Promise<ApiResponse<InquireLogs>> {
    try {
      const { data } = await this.inquiryService.create({
        studentUuid: req.user.studentUuid,
        inquiryType,
        inquiryReqUuid,
      });
      return {
        data,
        pagination: null,
        success: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      const { data, pagination } = await this.inquiryService.findAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
      return {
        data,
        pagination,
        success: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('student')
  @UseGuards(TokenAuthGuard)
  async findByStudentUuid(
    @Request() req: AuthenticatedRequest,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ): Promise<ApiResponse<InquireLogs[]>> {
    try {
      const { data, pagination } = await this.inquiryService.findByStudentUuid({
        studentUuid: req.user.studentUuid,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
      return {
        data,
        pagination,
        success: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch()
  async update(
    @Body() updateInquiryDto: TUpdateInquiryDTO,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const {
        data,
        meta: { inquiryType, studentUuid },
      } = await this.inquiryService.update(updateInquiryDto);
      await this.notifyService.createNotification(
        studentUuid,
        NotificationType.ACTIVITY_RESOLVED,
        {
          activityDescription: inquiryType,
        },
      );
      return {
        data,
        pagination: null,
        success: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
