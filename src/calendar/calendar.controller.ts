import { Body, Controller, Delete, Get, HttpException, HttpStatus, Patch, Post, Put, Query, UsePipes } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { bodyValidationPipe } from 'src/pipes/body-validation.pipe';
import { createHolidaySchema, TCreateHolidayDTO } from './zod-validation/createholiday-zod';
import { TUpdateHolidayDTO, updateHolidaySchema } from './zod-validation/updateholiday-zod';
import { findHolidaySchema, TFindHolidayDTO } from './zod-validation/findholiday-zod';
import { deleteHolidaySchema, TDeleteHolidayDTO } from './deleteholiday-zod';

@Controller('calendar')
export class CalendarController {
    constructor(private calendarService: CalendarService) { }

    @Get('all') // working
    async getAllHolidays() {
        return this.calendarService.getAllHolidays()
    }

    @Post('create-holiday') // working - but check for the invalid dates
    @UsePipes(new bodyValidationPipe(createHolidaySchema))
    async createHoliday(@Body() holidayPayload: TCreateHolidayDTO) {
        try {
            const result = await this.calendarService.createHoliday(holidayPayload)
            return result
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Patch('update-holiday') // working
    @UsePipes(new bodyValidationPipe(updateHolidaySchema))
    async updateHoliday(@Body() holidayPayload: TUpdateHolidayDTO) {
        try {
            const result = this.calendarService.updateHoliday(holidayPayload)
            return result
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Delete('delete-holiday') //working
    @UsePipes(new bodyValidationPipe(deleteHolidaySchema))
    async deleteHoliday(@Body() holidayPayload: TDeleteHolidayDTO) {
        return this.calendarService.deleteHoliday(holidayPayload)
    }

    @Get('find-holiday') //working
    @UsePipes(new bodyValidationPipe(findHolidaySchema))
    async findHoliday(@Body() holidayPayload: TFindHolidayDTO) {
        return this.calendarService.findHoliday(holidayPayload)
    }
}
