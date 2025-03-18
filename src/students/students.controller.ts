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
import { bulkBodyValidationPipe } from 'src/pipes/bulk-body-validation.pipe';
import { TstudentUUIDZod } from './zod-validation/studentuuid-zod';
import { HttpExceptionFilter } from 'src/misc/exception-filter';
import { TVisit_log } from './zod-validation/visitlog';

@Controller('student')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}
  
  @Get('all')
  async getAllStudents(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
    @Query('_search') search: string,
    @Query('_department') department: string,
    @Query('_year') year: string
  ) {
    return await this.studentsService.findAllStudents({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search: search ?? undefined,
      department: department ?? undefined,
      year: year ?? undefined,
    });
  }
  

  @Get('detail')
  @UsePipes(new QueryValidationPipe(studentQuerySchema, StudentQueryValidator))
  async getStudentDetail(@Query() query: UnionUser) {
    const result = await this.studentsService.findStudentBy(query);
    if (result) {
      return result;
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
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
  async createStudent(@Body() studentPayload: TCreateStudentDTO) {
    try {
      return await this.studentsService.createStudent2(studentPayload);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('bulk-create')
  @UsePipes(
    new bulkBodyValidationPipe<TCreateStudentDTO[]>(
      'student/student-zod-body-worker',
    ),
  )
  async bulkCreateStudent(@Body() arrStudentPayload: TCreateStudentDTO[]) {
    try {
      return this.studentsService.bulkCreate(arrStudentPayload);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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

  @Delete('bulk-delete')
  @UsePipes(
    new bulkBodyValidationPipe<TstudentUUIDZod[]>(
      'student/student-zod-uuid-worker',
    ),
  )
  async bulkDeleteStudent(@Body() arrStudentUUIDPayload: TstudentUUIDZod[]) {
    try {
      return this.studentsService.bulkDelete(arrStudentUUIDPayload);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
    console.log('working');
    return this.studentsService.updateStudentArchive(student_uuid, student_id);
  }

  @Put('restore')
  async restoreArchive(
    @Body('student_uuid') student_uuid: string,
    @Body('student_id') student_id: string,
  ) {
    console.log('working');
    return this.studentsService.restoreStudentArchive(student_uuid, student_id);
  }

  @Get('export')
  async exportAllStudents() {
    return await this.studentsService.exportAllStudents();
  }

  //Visitlog

  @Get('alllog')
  async getAllLog(){
    try {
      return await this.studentsService.getVisitAllLog()
    } catch (error) {
      console.log(error);
    }
  }
  @Get('visitlog_by_uuid')
async getVisitlog(@Query('_student_id') student_ID: string) {
  try {
    console.log(student_ID)
    return await this.studentsService.getVisitLogByStudentUUID(student_ID);
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
async visitlog(@Body() createvlogpayload:TVisit_log){
 try {
  if(createvlogpayload.action==='entry'){
    return await this.studentsService.visitlogentry(createvlogpayload)
      }
      else if(createvlogpayload.action==='exit'){
       return await this.studentsService.visitlogexit(createvlogpayload) 
      }
      else{
        throw new HttpException("Invalid action. Use 'entry' or 'exit'.", HttpStatus.BAD_REQUEST);
      }
    
 } catch (error) {
  throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
 }
  
}
}
