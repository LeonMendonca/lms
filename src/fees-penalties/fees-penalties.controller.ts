import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  updateFeesPenaltiesZod,
  TUpdateFeesPenaltiesZod,
} from 'src/books_v2/zod/update-fp-zod';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { FeesPenaltiesService } from './fees-penalties.service';
import { createPenaltyZod, TCreatePenaltyZod } from './zod/create-penalty-zod';
import { student } from 'src/students/students.entity';
import { TokenAuthGuard } from 'src/guards/token.guard';
import { StudentsService } from 'src/students/students.service';

interface AuthenticatedRequest extends Request {
  user?: any; // Ideally, replace `any` with your `User` type
}
@Controller('fees-penalties')
export class FeesPenaltiesController {
  constructor(
    private feesPenaltiesService: FeesPenaltiesService,
    private readonly studentService: StudentsService,
  ) {}

  @Put('pay-student-fee')
  @UsePipes(new bodyValidationPipe(updateFeesPenaltiesZod))
  async payStudentFee(@Body() feesPayload: TUpdateFeesPenaltiesZod) {
    try {
      return await this.feesPenaltiesService.payStudentFee(feesPayload);
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

  @Post('pay-student-fee-periodicals')
  @UsePipes(new bodyValidationPipe(createPenaltyZod))
  async payStudentFeeForPeriodicals(@Body() feesPayload: TCreatePenaltyZod) {
    try {
      return await this.feesPenaltiesService.payStudentFeeForPeriodicals(
        feesPayload,
      );
    } catch (error) {
      return { error: error };
    }
  }

  @Get('get-student-fee') // done
  @UseGuards(TokenAuthGuard)
  async getStudentFeeHistory(
    @Request() req: AuthenticatedRequest,
    @Query('_student_id') studentId: string,
    @Query('_ispenalised') isPenalty: string,
    @Query('_iscompleted') isCompleted: string,
  ) {
    const student = await this.studentService.findStudentBy({
      student_id: req.user.student_id,
    });
    if (!student) {
      throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
    }
    return this.feesPenaltiesService.getStudentFee({
      studentId: student?.student_uuid ?? '',
      isPenalty: JSON.parse(isPenalty || 'false'),
      isCompleted: JSON.parse(isCompleted || 'false'),
    });
  }

  // async getStudentFeeHistory(
  //     @Query('_student_id') studentId: string,
  //     @Query('_ispenalised') isPenalty: boolean,
  //     @Query('_iscompleted') isCompleted: boolean,
  // ) {
  //     try {
  //         if (studentId) {
  //             return await this.feesPenaltiesService.getStudentFee(
  //                 studentId,
  //                 isPenalty,
  //                 isCompleted,
  //             );
  //         } else if (isPenalty) {
  //             return await this.feesPenaltiesService.getStudentFee(
  //                 studentId,
  //                 isPenalty,
  //                 isCompleted,
  //             );
  //         } else if (isCompleted) {
  //             return await this.feesPenaltiesService.getStudentFee(
  //                 studentId,
  //                 isPenalty,
  //                 isCompleted,
  //             );
  //         }
  //     } catch (error) {
  //         if (!(error instanceof HttpException)) {
  //             throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //         }
  //         throw error;
  //     }
  // }

  @Get('get-full-feelist') // done
  async getFullFeeList(
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    try {
      return await this.feesPenaltiesService.getFullFeeList({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
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

  @Get('get-full-feelist-student') // done
  async getFullFeeListStudent(@Query('student_id') student_id: string) {
    try {
      return await this.feesPenaltiesService.getFullFeeListStudent(student_id);
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

  @Get('generate-fee-report')
  async generateFeeReport(
    @Query('start') start: Date,
    @Query('end') end: Date,
    @Query('_page') page: string,
    @Query('_limit') limit: string,
  ) {
    try {
      return await this.feesPenaltiesService.generateFeeReport(
        start,
        end,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
      );
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

  // -------- FILTER ROUTES -----------


  // Get penalties which are yet to be paid
  @Get('get-pending-penalties')
  async getPenaltiesToBePaid(){
    return await this.feesPenaltiesService.getPenaltiesToBePaid()
  }
  
  // Get penalties which are paid
  @Get('get-completed-penalties')
  async getCompletedPenalties(){
    return await this.feesPenaltiesService.getCompletedPenalties()
  }
}
