import { Body, Controller, Get, HttpException, HttpStatus, Put, Query, UsePipes } from '@nestjs/common';
import { updateFeesPenaltiesZod, TUpdateFeesPenaltiesZod } from 'src/books_v2/zod/update-fp-zod';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { FeesPenaltiesService } from './fees-penalties.service';

@Controller('fees-penalties')
export class FeesPenaltiesController {

    constructor(private feesPenaltiesService: FeesPenaltiesService) { }

    @Put('pay_student_fee')
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

    @Get('get_student_fee')
    async getStudentFeeHistory(
        @Query('_student_id') studentId: string,
        @Query('_ispenalised') isPenalty: boolean,
        @Query('_iscompleted') isCompleted: boolean,
    ) {
        try {
            if (studentId) {
                return await this.feesPenaltiesService.getStudentFee(
                    studentId,
                    isPenalty,
                    isCompleted,
                );
            } else if (isPenalty) {
                return await this.feesPenaltiesService.getStudentFee(
                    studentId,
                    isPenalty,
                    isCompleted,
                );
            } else if (isCompleted) {
                return await this.feesPenaltiesService.getStudentFee(
                    studentId,
                    isPenalty,
                    isCompleted,
                );
            }
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    @Get('get_full_feelist')
    async getFullFeeList(
        @Query('_page') page: string,
        @Query('_limit') limit: string,
    ) {
        try {
            return await this.feesPenaltiesService.getFullFeeList({
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 10
            }
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

    @Get('get_full_feelist_student')
    async getFullFeeListStudent() {
        try {
            return await this.feesPenaltiesService.getFullFeeListStudent();
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

    @Get('generate_fee_report')
    async generateFeeReport(
        @Query('start') start: Date,
        @Query('end') end: Date,
        @Query('_page') page: string,
        @Query('_limit') limit: string,
    ) {
        try {
            return await this.feesPenaltiesService.generateFeeReport(start,
                end,
                page ? parseInt(page, 10) : 1,
                limit ? parseInt(limit, 10) : 10
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
}
