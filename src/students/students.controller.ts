import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Req,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import type { Request } from 'express';
import { StudentsService } from './students.service';
import { QueryValidationPipe } from '../query-validation.pipe';
import { studentQuerySchema } from './zod-validation/studentquery-zod';
import { StudentQueryValidator } from './student.query-validator';
import type { UnionUser } from './students.types';
import { booksValidationPipe } from 'src/books/books.pipe';
import {
  createStudentSchema,
  TCreateStudentDTO,
} from './zod-validation/createstudents-zod';

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
  @UsePipes(new booksValidationPipe(createStudentSchema))
  createStudent(@Body() studentPayload: TCreateStudentDTO) {
    return this.studentsService.createStudent(studentPayload);
  }

  @Patch('edit')
  patchStudent(@Body() studentPayload: any, @Req() request: Request) {
    return `${request.method} from ${request.ip} data : ${{ ...studentPayload }}`;
  }
}
