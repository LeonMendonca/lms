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
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { QueryValidationPipe } from '../pipes/query-validation.pipe';
import { studentQuerySchema } from './zod-validation/studentquery-zod';
import type { UnionUser } from './students.query-validator';
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

@Controller('student')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}
  @Get('all')
  async getAllStudents() {
    return await this.studentsService.findAllStudents();
  }

  @Get('search')
  @UsePipes(new QueryValidationPipe(studentQuerySchema, StudentQueryValidator))
  async getStudentBy(@Query() query: UnionUser) {
    const result = await this.studentsService.findStudentBy(query);
    if (result.length != 0) {
      return result[0];
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('create')
  @UsePipes(new bodyValidationPipe(createStudentSchema))
  async createStudent(@Body() studentPayload: TCreateStudentDTO) {
    try {
      return await this.studentsService.createStudent(studentPayload);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Put('edit/:student_uuid')
  @UsePipes(new putBodyValidationPipe(editStudentSchema))
  async editStudent(
    @Param(
      'student_uuid',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    studentId: string,
    @Body() studentPayload: TEditStudentDTO,
  ) {
    try {
      const result = await this.studentsService.editStudent(
        studentId,
        studentPayload,
      );
      if (result[1]) {
        return {
          statusCode: HttpStatus.OK,
          message: `User id ${studentId} updated successfully!`,
        };
      } else {
        throw new Error(`User with id ${studentId} not found`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  @Delete('delete/:student_uuid')
  async deleteStudent(
    @Param('student_uuid', new ParseUUIDPipe()) studentId: string,
  ) {
    try {
      const result = await this.studentsService.deleteStudent(studentId);
      if (result[1]) {
        return {
          statusCode: HttpStatus.OK,
          message: `User id ${studentId} deleted successfully!`,
        };
      } else {
        throw new Error(`User with id ${studentId} not found`);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
