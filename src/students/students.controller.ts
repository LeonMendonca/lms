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
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { TokenAuthGuard } from '../../utils/guards/token.guard';
import { StudentsVisitKey } from './entities/student-visit-key';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';
import { StudentNotifyService } from 'src/student-notify/student-notify.service';
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
import { TStudentVisitDTO } from './dto/student-visit.dto';
import { VisitLog } from './entities/visitlog.entity';

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

  @Get('admin-dashboard')
  async adminDashboard(
    @Query('_institute_uuid') instituteUuid: string | null,
  ): Promise<ApiResponse<DashboardCardtypes>> {
    // return this.fetchData(this.studentsService.adminDashboard, institute_uuid);
    try {
      const { data } = await this.studentsService.adminDashboard(instituteUuid);
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
      const { data } = await this.studentsService.studentDashboard(
        req.user.studentUuid,
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
  ): Promise<ApiResponse<StudentsVisitKey>> {
    try {
      const { data } = await this.studentsService.createStudentVisitKey(
        req.user.studentUuid,
        parseFloat(latitude),
        parseFloat(longitude),
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
      }
      throw error;
    }
  }

  @Get('verify-student-visit-key/:student_key_uuid')
  async getStudentVisitKey(
    @Param('student_key_uuid', ParseUUIDPipe) studentKeyUuid: string,
  ): Promise<ApiResponse<VisitLog>> {
    try {
      const { data, meta } =
        await this.studentsService.verifyStudentVisitKey(studentKeyUuid);

      return { data, pagination: null, success: true, meta };
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
    @Param('student_key_uuid', ParseUUIDPipe) studentKeyUuid: string,
  ): Promise<ApiResponse<{ status: boolean }>> {
    try {
      const { data, meta } =
        await this.studentsService.checkVisitKeyStatus(studentKeyUuid);
      return {
        success: true,
        data,
        pagination: null,
        meta,
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
  ): Promise<ApiResponse<VisitLog[]>> {
    try {
      const { data, pagination } = await this.studentsService.getVisitAllLog({
        ...query,
        instituteUuid: JSON.parse(institute_uuid || '[]'),
      });
      return {
        data,
        pagination,
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

  @Get('all_visit_log')
  async getCompleteVisitLog(
    // @Request() req: AuthenticatedRequest,
    @Query('_page') page: string,
    @Query('_limit') limit: string,

    @Query('_from_date') fromDate: string,
    @Query('_to_date') toDate: string,

    @Query('_from_time') fromTime: string,
    @Query('_to_time') toTime: string,
  ): Promise<ApiResponse<VisitLog[]>> {
    try {
      const { data, pagination } =
        await this.studentsService.getCompleteVisitLog({
          page: page ? parseInt(page, 10) : 1,
          limit: limit ? parseInt(limit, 10) : 10,
          fromDate: fromDate,
          toDate: toDate,
          fromTime: fromTime,
          toTime: toTime,
        });
      return {
        data,
        pagination,
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

  @Get('visitlog_by_id')
  @UseGuards(TokenAuthGuard)
  async getVisitlog(
    @Request() req: AuthenticatedRequest,
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<VisitLog[]>> {
    try {
      const { data, pagination } =
        await this.studentsService.getVisitLogByStudentUUID({
          ...query,
          studentUuid: req.user.studentUuid,
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

  @Get('activity')
  @UseGuards(TokenAuthGuard)
  async getActivity(
    @Request() req: AuthenticatedRequest,
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<VisitLog[]>> {
    try {
      const { data, pagination } =
        await this.studentsService.getVisitLogByStudentUUID({
          ...query,
          studentUuid: req.user.studentUuid,
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

  @Post('visitlog')
  async visitlog(
    @Body() { studentId }: TStudentVisitDTO,
  ): Promise<ApiResponse<VisitLog>> {
    try {
      if (!studentId) {
        throw new HttpException(
          'Student ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const { data: studentData } =
        await this.studentsService.findStudentBy(studentId);
      if (!studentData) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      try {
        const { data, pagination } = await this.studentsService.visitlogentry({
          studentUuid: studentData.studentUuid,
        });
        return {
          data,
          pagination,
          success: true,
          meta: { message: 'Entry Log' },
        };
      } catch (error) {
        if (error?.message.includes('Previous entry not exited')) {
          const { data, pagination } = await this.studentsService.visitlogexit({
            studentUuid: studentData.studentUuid,
          });
          return {
            data,
            pagination,
            success: true,
            meta: { message: 'Entry Log' },
          };
        } else {
          throw new HttpException(
            'Invalid action type',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
