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
} from '@nestjs/common';
import type { Request } from 'express';
import { StudentsService } from './students.service';

@Controller('student')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}
  @Get('all')
  async getAllStudents() {
    return await this.studentsService.findAllStudents();
  }

  @Get('search')
  async getStudentBy(@Query() query: object) {
    const result = await this.studentsService.findStudentBy(query);
    if (result && result.length != 0) {
      return result[0];
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('create')
  createStudent(@Body() studentPayload: any, @Req() request: Request) {
    return `${request.method} from ${request.ip} data : ${{ ...studentPayload }}`;
  }

  @Patch('edit')
  patchStudent(@Body() studentPayload: any, @Req() request: Request) {
    return `${request.method} from ${request.ip} data : ${{ ...studentPayload }}`;
  }
}
