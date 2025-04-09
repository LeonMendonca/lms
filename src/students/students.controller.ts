// @ts-nocheck
import {
  Controller,
  Body,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
  UsePipes,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  Request,
  Patch,
} from '@nestjs/common';

import { StudentsService } from './students.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';

import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { TVisit_log } from './zod-validation/visitlog';
import { TokenAuthGuard } from '../guards/token.guard';
import { StudentsVisitKey } from './entities/student-visit-key';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
import { NotificationType } from 'src/student-notify/entities/student-notify.entity';
import {
  DashboardCardtypes,
  StudentCardtypes,
} from 'src/students/types/dashboard';
import { StudentsData } from './entities/student.entity';
import {
  createStudentSchema,
  TCreateStudentDTO,
} from './dto/student-create.dto';
import { editStudentDto, TEditStudentDTO } from './dto/student-update.dto';
import { TStudentUuidZod } from './dto/student-bulk-delete.dto';
import { studentCredDTO, TStudentCredDTO } from './dto/student-login.dto';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: any,
  pagination: {} | null;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

@Controller('student')
export class StudentsController {
  constructor(
    private studentsService: StudentsService,
    private readonly notifyService: StudentNotifyService,
  ) {}

  @Post('login')
  @UsePipes(new bodyValidationPipe(studentCredDTO))
  async studentLogin(
    @Body() studentCredPayload: TStudentCredDTO,
  ): Promise<ApiResponse<StudentsData>> {
    try {
      const { data, meta } =
        await this.studentsService.studentLogin(studentCredPayload);
      return {
        data,
        meta,
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
  @UsePipes(new bodyValidationPipe(createStudentSchema))
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @Body() studentPayload: TCreateStudentDTO,
  ): Promise<ApiResponse<StudentsData>> {
    try {
      const { data } = await this.studentsService.createStudent(studentPayload);
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

  @Get('department')
  async getAllDepartments(): Promise<ApiResponse<string[]>> {
    try {
      const { data } = await this.studentsService.getAllDepartments();
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
      } else {
        throw error;
      }
    }
  }

  @Get()
  async getAllStudents(
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
    @Query('_institute_uuid') institute_uuid: string,
  ): Promise<ApiResponse<StudentsData[]>> {
    const { data, pagination } = await this.studentsService.findAllStudents({
      ...query,
      institute_uuid: JSON.parse(institute_uuid || '[]'),
    });
    return {
      success: true,
      data,
      pagination,
    };
  }

  @Put(':student_uuid')
  @UsePipes(new putBodyValidationPipe(editStudentDto))
  async editStudent(
    @Param('student_uuid') studentUuid: string,
    @Body() studentPayload: TEditStudentDTO,
  ): Promise<ApiResponse<StudentsData>> {
    try {
      const { data } = await this.studentsService.editStudent(
        studentUuid,
        studentPayload,
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

  @Get(':student_uuid')
  async getStudentDetail(
    @Param('student_uuid') studentUuid: string,
  ): Promise<ApiResponse<StudentsData>> {
    try {
      const { data } = await this.studentsService.findStudentBy(studentUuid);
      return {
        data,
        pagination: null,
        success: true,
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

  @Post('bulk-create')
  @UsePipes(
    new bulkBodyValidationPipe<
      TCreateStudentDTO,
      {
        validated_array: TCreateStudentDTO[];
        invalid_data_count: number;
      }
    >('student/student-zod-body-worker'),
  )
  async bulkCreateStudent(
    @Body()
    studentZodValidatedObject: {
      validated_array: TCreateStudentDTO[];
      invalid_data_count: number;
    },
  ): Promise<
    ApiResponse<{
      invalid_data: number;
      inserted_data: number;
      duplicate_data_pl: number;
      duplicate_date_db: number;
      unique_data: number;
    }>
  > {
    try {
      const { data } = await this.studentsService.bulkCreate(
        studentZodValidatedObject,
      );
      return {
        data,
        pagination: null,
        success: true,
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

  @Delete('bulk-delete')
  @UsePipes(
    new bulkBodyValidationPipe<
      TStudentUuidZod,
      {
        validated_array: TStudentUuidZod[];
        invalid_data_count: number;
      }
    >('student/student-zod-uuid-worker'),
  )
  async bulkDeleteStudent(
    @Body()
    studentZodValidatedUUIDObject: {
      validated_array: TStudentUuidZod[];
      invalid_data_count: number;
    },
  ): Promise<
    ApiResponse<{
      invalid_data: number;
      archived_data: number;
      failed_archived_data: number;
    }>
  > {
    try {
      const { data } = await this.studentsService.bulkDelete(
        studentZodValidatedUUIDObject,
      );
      return {
        data,
        pagination: null,
        success: true,
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

  protected async fetchData<T>(method: Function, ...args: any[]): Promise<T> {
    try {
      const response = await method(...args);
      return response.data;
    } catch (error) {
      // Handle errors appropriately
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  @Get('admin-dashboard')
  async adminDashboard(
    @Query('_institute_uuid') institute_uuid: string | null,
  ): Promise<ApiResponse<DashboardCardtypes>> {
    // return this.fetchData(this.studentsService.adminDashboard, institute_uuid);
    try {
      const { data } =
        await this.studentsService.adminDashboard(institute_uuid);
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

  @Get('student-dashboard')
  @UseGuards(TokenAuthGuard)
  async studentDashboard(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<StudentCardtypes>> {
    try {
      const user = req.user.studentUuid;
      const { data } = await this.studentsService.studentDashboard(user);
      return {
        data,
        pagination: null,
        success: true,
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

  //Visitlog

  @Get('alllog')
  async getAllLog(
    // @Request() req: AuthenticatedRequest,
    @Query('_institute_uuid') institute_uuid: string,
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ) {
    try {
      return await this.studentsService.getVisitAllLog({
        ...query,
        institute_uuid: JSON.parse(institute_uuid || '[]'),
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Get('all_visit_log')
  async getCompleteVisitLog(
    // @Request() req: AuthenticatedRequest,
    @Query('_page') page: string,
    @Query('_limit') limit: string,

    @Query('_from_date') fromDate: string,
    @Query('_to_date') toDate: string,

    @Query('_from_time') fromTime: string,
    @Query('_to_time') toTime: string,
  ) {
    try {
      return await this.studentsService.getCompleteVisitLog({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        fromDate: fromDate,
        toDate: toDate,
        fromTime: fromTime,
        toTime: toTime,
      });
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

  @Get('visitlog_by_id')
  @UseGuards(TokenAuthGuard)
  async getVisitlog(
    @Request() req: AuthenticatedRequest,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      const student = await this.studentsService.findStudentBy({
        student_id: req.user.student_id,
      });
      console.log(student);
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      return await this.studentsService.getVisitLogByStudentUUID({
        student_id: student.student_uuid,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('activity')
  @UseGuards(TokenAuthGuard)
  async getActivity(
    @Request() req: AuthenticatedRequest,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      const student = await this.studentsService.findStudentBy({
        student_id: req.user.student_id,
      });
      console.log(student);
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      return await this.studentsService.getVisitLogByStudentUUID({
        student_id: student.student_uuid,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('report-inquiry')
  @UseGuards(TokenAuthGuard)
  async createInquiryLog(
    @Request() req: AuthenticatedRequest,
    @Body('inquiry_type') type: string,
    @Body('inquiry_uuid') inquiryUuid: string,
  ) {
    try {
      const student = await this.studentsService.findStudentBy({
        student_id: req.user.student_id,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      const data = await this.studentsService.reportInquiryLog({
        student,
        type,
        inquiryUuid,
      });
      await this.notifyService.createNotification(
        student!.student_uuid,
        NotificationType.ACTIVITY_REPORTED,
        {
          activityDescription: type,
        },
      );
      return data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('report-inquiry-action')
  async inquiryLogAction(
    @Body('action_type') type: string,
    @Body('report_uuid') report_uuid: string,
  ) {
    try {
      const data = await this.studentsService.inquiryLogAction({
        type,
        report_uuid,
      });
      const student = await this.studentsService.findStudentBy({
        student_uuid: data.meta.student_uuid,
      });
      await this.notifyService.createNotification(
        student!.student_uuid,
        NotificationType.ACTIVITY_RESOLVED,
        {
          courseName: data.meta.inquiry_type,
        },
      );
      return data;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-student-inquiry')
  @UseGuards(TokenAuthGuard)
  async getInquiryLogByStudentUUID(
    @Request() req: AuthenticatedRequest,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      const student = await this.studentsService.findStudentBy({
        student_id: req.user.student_id,
      });

      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      return await this.studentsService.getInquiryLogByStudentUUID({
        student_uuid: student.student_uuid,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-admin-inquiry')
  @UseGuards(TokenAuthGuard)
  async getAllInquiryLog(
    @Request() req: AuthenticatedRequest,
    @Query('_page') page: string = '1',
    @Query('_limit') limit: string = '10',
  ) {
    try {
      return await this.studentsService.getAllInquiry({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('visitlog')
  async visitlog(@Body() createvlogpayload: TVisit_log) {
    try {
      const student = await this.studentsService.findStudentBy({
        student_id: createvlogpayload.student_id,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      if (createvlogpayload.action === 'entry') {
        const data =
          await this.studentsService.visitlogentry(createvlogpayload);
        // await this.notifyService.createNotification(
        //   student.student_uuid,
        //   NotificationType.LIBRARY_ENTRY,
        //   {}
        // );
        return data;
      } else if (createvlogpayload.action === 'exit') {
        const data = await this.studentsService.visitlogexit(createvlogpayload);
        // await this.notifyService.createNotification(
        //   student.student_uuid,
        //   NotificationType.LIBRARY_EXIT,
        //   {}
        // );
        return data;
      } else {
        throw new HttpException(
          "Invalid action. Use 'entry' or 'exit'.",
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('student-profile')
  async student_profile(@Query('_student_id') student_id: string) {
    try {
      return await this.studentsService.studentProfile(student_id);
    } catch (error) {
      if (!(error instanceof HttpException)) {
        throw new HttpException(error.message, HttpStatus.BAD_GATEWAY);
      }
      throw error;
    }
  }

  @Post('student-visit-key')
  @UseGuards(TokenAuthGuard)
  async studentVisitKey(
    @Request() req: AuthenticatedRequest,
    @Body('longitude') longitude: string,
    @Body('latitude') latitude: string,
    // @Body('action') action: string,
  ): Promise<ApiResponse<StudentsVisitKey>> {
    try {
      const user = req.user;
      const student = await this.studentsService.findStudentBy({
        student_id: user.student_id,
      });
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }

      const createKey = await this.studentsService.createStudentVisitKey(
        student,
        parseFloat(latitude),
        parseFloat(longitude),
        'entry',
      );
      return {
        success: true,
        data: createKey,
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

  @Get('verify-student-visit-key/:student_key_uuid')
  async getStudentVisitKey(
    @Param('student_key_uuid', ParseUUIDPipe) student_key_uuid: string,
  ) {
    try {
      const visitKey =
        await this.studentsService.verifyStudentVisitKey(student_key_uuid);
      if (visitKey.message.includes('Visit log entry created successfully')) {
        await this.notifyService.createNotification(
          visitKey.meta.student_uuid,
          NotificationType.LIBRARY_ENTRY,
          {},
        );
      } else {
        await this.notifyService.createNotification(
          visitKey.meta.student_uuid,
          NotificationType.LIBRARY_EXIT,
          {},
        );
      }

      return visitKey;
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

  @Get('check-status-of-key/:student_key_uuid')
  async checkStatusofKey(
    @Param('student_key_uuid', ParseUUIDPipe) student_key_uuid: string,
  ): Promise<ApiResponse<{ status: any }>> {
    try {
      const { data } =
        await this.studentsService.checkVisitKeyStatus(student_key_uuid);
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
      }
      throw error;
    }
  }
}
