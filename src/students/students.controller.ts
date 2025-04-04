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
  UseFilters,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Request,
  Patch,
} from '@nestjs/common';
const jwt = require('jsonwebtoken');

import { StudentsService } from './students.service';
import { QueryValidationPipe } from '../pipes/query-validation.pipe';
import { studentQuerySchema } from './zod-validation/studentquery-zod';
import type { UnionStudent } from './students.query-validator';
import { StudentQueryValidator } from './students.query-validator';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import {
  createStudentSchema,
  TCreateStudentDTO,
} from './zod-validation/createstudents-zod';
import { putBodyValidationPipe } from 'src/pipes/put-body-validation.pipe';
import {
  editStudentSchema,
  TEditStudentDTO,
} from './zod-validation/putstudent-zod';
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { TstudentUUIDZod } from './zod-validation/studentuuid-zod';
import { HttpExceptionFilter } from 'src/misc/exception-filter';
import { TVisit_log } from './zod-validation/visitlog';
import {
  studentCredZodSchema,
  TStudentCredZodType,
} from './zod-validation/studentcred-zod';
import { TokenAuthGuard } from '../guards/token.guard';
import { Students } from './students.entity';
import { StudentsVisitKey } from './entities/student-visit-key';
import {
  PaginationParserType,
  ParsePaginationPipe,
} from 'src/pipes/pagination-parser.pipe';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  pagination: {} | null;
  error?: string;
}

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}

@Controller('student')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('all')
  @UseGuards(TokenAuthGuard)
  async getAllStudents(
    @Query(new ParsePaginationPipe()) query: PaginationParserType,
  ): Promise<ApiResponse<Students[]>> {
    console.log(query);
    const { data, pagination } =
      await this.studentsService.findAllStudents(query);
    return {
      success: true,
      data,
      pagination,
    };
  }

  @Get('detail')
  @UsePipes(new QueryValidationPipe(studentQuerySchema, StudentQueryValidator))
  async getStudentDetail(@Query() query: UnionStudent) {
    try {
      const result = await this.studentsService.findStudentBy(query);
      if (result) {
        return result;
      } else {
        throw new HttpException('No user found', HttpStatus.NOT_FOUND);
      }
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

  @Get('departments')
  async getAllDepartments() {
    try {
      const result = await this.studentsService.getAllDepartments();
      if (result) {
        return result;
      } else {
        throw new HttpException('No department found', HttpStatus.NOT_FOUND);
      }
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

  //@Get('search')
  //async getStudentBy(@Query() query: UnionUser) {
  //  const result = await this.studentsService.findStudentBy(query);
  //  if (result.length != 0) {
  //    return result[0];
  //  } else {
  //    throw new HttpException('No user found', HttpStatus.NOT_FOUND);
  //  }
  //}

  @Post('create')
  @UsePipes(new bodyValidationPipe(createStudentSchema))
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @Body() studentPayload: TCreateStudentDTO,
  ): Promise<ApiResponse<Students>> {
    try {
      const data: Students =
        await this.studentsService.createStudent(studentPayload);
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
  ) {
    try {
      console.log('CONTROLLER Moving to service');
      return await this.studentsService.bulkCreate(studentZodValidatedObject);
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

  @Put('edit/:_student_id')
  @UsePipes(new putBodyValidationPipe(editStudentSchema))
  async editStudent(
    @Param('_student_id') studentId: string,
    @Body() studentPayload: TEditStudentDTO,
  ): Promise<ApiResponse<Students>> {
    try {
      const data = await this.studentsService.editStudent(
        studentId,
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

  @Delete('delete/:_student_id')
  async deleteStudent(@Param('_student_id') studentId: string) {
    try {
      const result = await this.studentsService.deleteStudent(studentId);
      if (!result[1]) {
        throw new HttpException(
          `User with id ${studentId} not found or archived`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: `User id ${studentId} deleted successfully!`,
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
      TstudentUUIDZod,
      {
        validated_array: TstudentUUIDZod[];
        invalid_data_count: number;
      }
    >('student/student-zod-uuid-worker'),
  )
  async bulkDeleteStudent(
    @Body()
    studentZodValidatedUUIDObject: {
      validated_array: TstudentUUIDZod[];
      invalid_data_count: number;
    },
  ) {
    try {
      const result = await this.studentsService.bulkDelete(
        studentZodValidatedUUIDObject,
      );
      return result;
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

  @Get('archive')
  async getAllArchivedStudents(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
  ) {
    return await this.studentsService.findAllArchivedStudents({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
    });
  }

  @Put('archive')
  async updateArchive(
    @Body('student_uuid') student_uuid: string,
    @Body('student_id') student_id: string,
  ) {
    try {
      const result = await this.studentsService.updateStudentArchive(
        student_uuid,
        student_id,
      );
      if (!result) {
        throw new HttpException(
          'Student not found or already archived',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Student archived successfully',
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

  @Put('restore')
  async restoreArchive(
    @Body('student_uuid') student_uuid: string,
    @Body('student_id') student_id: string,
  ) {
    const result = await this.studentsService.restoreStudentArchive(
      student_uuid,
      student_id,
    );
    if (!result) {
      throw new HttpException(
        'Student not found or already restored',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Student restored successfully',
    };
  }
  catch(error) {
    if (!(error instanceof HttpException)) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      throw error;
    }
  }

  @Get('export')
  async exportAllStudents() {
    try {
      return await this.studentsService.exportAllStudents();
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

  //Visitlog

  @Get('alllog')
  async getAllLog(
    // @Request() req: AuthenticatedRequest,
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    try {
      return await this.studentsService.getVisitAllLog({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
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
  ) {
    try {
      return await this.studentsService.getCompleteVisitLog({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
    } catch (error) {
      console.log(error);
    }
  }
  //   @Get('visitlog_by_id')
  // async getVisitlog(
  //     @Query('_student_id') student_ID: string,
  //     @Query('_page') page: string,
  //     @Query('_limit') limit: string,
  // ) {
  //   try {
  //     console.log(student_ID)
  //     return await this.studentsService.getVisitLogByStudentUUID(student_ID,page,limit);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

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
      return await this.studentsService.reportInquiryLog({
        student,
        type,
        inquiryUuid,
      });
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
      return await this.studentsService.inquiryLogAction({
        type,
        report_uuid,
      });
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

  // @Post("vistlog_entry")
  //   async createVisitLog(@Body()createvisitpayload:TVisit_log) {
  //     try {
  //       return await this.studentsService.visitlogentry(createvisitpayload);
  //     } catch (error) {
  //       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //     }
  //   }

  //   @Post("vistlog_exit")
  //   async createVisitExit(@Body() createvlogpayload:TVisit_log) {
  //     try {
  //       return await this.studentsService.visitlogexit(createvlogpayload);
  //     } catch (error) {
  //       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //     }
  //   }
  @Post('visitlog')
  async visitlog(@Body() createvlogpayload: TVisit_log) {
    try {
      if (createvlogpayload.action === 'entry') {
        return await this.studentsService.visitlogentry(createvlogpayload);
      } else if (createvlogpayload.action === 'exit') {
        return await this.studentsService.visitlogexit(createvlogpayload);
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

  @Post('login')
  @UsePipes(new bodyValidationPipe(studentCredZodSchema))
  async studentLogin(@Body() studentCredPayload: TStudentCredZodType) {
    try {
      return await this.studentsService.studentLogin(studentCredPayload);
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
  async studentDashboard(@Request() req: AuthenticatedRequest) {
    try {
      const user = req.user;
      return await this.studentsService.studentDashboard(user);
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

  @Get('admin-dashboard')
  async adminDashboard(
    @Query('_institute_uuid') institute_uuid: string | null,
  ) {
    try {
      return await this.studentsService.adminDashboard(institute_uuid);
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
    @Body('longitude') longitude: number,
    @Body('latitude') latitude: number,
    @Body('action') action: string,
  ): Promise<ApiResponse<StudentsVisitKey>> {
    try {
      const user = req.user;
      const createKey = await this.studentsService.createStudentVisitKey(
        user,
        latitude,
        longitude,
        action,
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
