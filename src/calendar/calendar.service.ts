import { format } from "date-fns";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar } from './entity/calendar.entity';
import { DeleteQueryBuilder, Repository } from 'typeorm';
import { TCreateHolidayDTO } from "./zod-validation/createholiday-zod";
import { TUpdateHolidayDTO, updateHolidaySchema } from "./zod-validation/updateholiday-zod";
import { insertQueryHelper, selectQueryHelper, updateQueryHelper } from "src/misc/custom-query-helper";
// import { query } from "express";
import { TFindHolidayDTO } from "./zod-validation/findholiday-zod";
import { TDeleteHolidayDTO } from "./deleteholiday-zod";

@Injectable()
export class CalendarService {

    constructor(
        @InjectRepository(Calendar)
        private calendar: Repository<Calendar>,
    ) { }

    async getAllHolidays() {
        const holidays = await this.calendar.query(
            `SELECT * FROM calendar`
        )
        return holidays
    }

    async createHoliday(holidayPayload: TCreateHolidayDTO) {
        // check if holiday exists
        const newHoliday = await this.calendar.query(
            `SELECT * FROM calendar WHERE holiday_date='${holidayPayload.holiday_date}'`
        )
        if (!newHoliday.length) {
            const holiday = await this.calendar.query(
                `INSERT INTO calendar (holiday_date, holiday_reason) VALUES ($1, $2)`,
                [holidayPayload.holiday_date, holidayPayload.holiday_reason]
            )
            return {
                message: "New Holiday Inserted Into Table",
                holiday: holiday,
            }
        } else {
            return { message: "Holiday Already Exists" }
        }
    }

    async updateHoliday(holidayPayload: TUpdateHolidayDTO) {
        const queryData = updateQueryHelper<TUpdateHolidayDTO>(holidayPayload, [])
        // check if holiday_date exists
        const holiday = await this.calendar.query(
            `SELECT * FROM calendar WHERE holiday_date='${holidayPayload.holiday_date}'`
        )
        // if it exists then hcange the reason otherwise give an error message
        if (!holiday.length) {
            return { message: "Holiday Does Not Exist" }
        } else {
            const result = await this.calendar.query(
                `UPDATE calendar SET holiday_reason=$1`, [holidayPayload.holiday_reason]
            )
            return {
                message: "Holiday Updated Successfully!",
                result: result
            }
        }
    }

    async deleteHoliday(holidayPayload: TDeleteHolidayDTO) {

        if (!holidayPayload.sr_no && !holidayPayload.holiday_date && !holidayPayload.holiday_reason) {
            return { message: "At least one input is required." };
        }

        const holiday = await this.calendar.query(
            `SELECT * FROM calendar WHERE sr_no=$1 OR holiday_date=$2 OR holiday_reason=$3`,
            [holidayPayload.sr_no, holidayPayload.holiday_date, holidayPayload.holiday_reason]
        )

        if (holiday.length) {
            // delete
            const deleteHoliday = await this.calendar.query(
                `DELETE FROM calendar WHERE sr_no=$1 OR holiday_date=$2 OR holiday_reason=$3`,
                [holidayPayload.sr_no, holidayPayload.holiday_date, holidayPayload.holiday_reason]
            )
            return {
                message: "Holiday Deleted Successfully!",
                holiday: holiday
            }
        } else {
            return { message: "No Such Holiday" }
        }
    }

    async findHoliday(holidayPayload: TFindHolidayDTO) {
        if (!holidayPayload.sr_no && !holidayPayload.holiday_date && !holidayPayload.holiday_reason) {
            return { message: "At least one input is required." };
        }
        const holiday = await this.calendar.query(
            `SELECT * FROM calendar WHERE sr_no=$1 OR holiday_date=$2 OR holiday_reason=$3`,
            [holidayPayload.sr_no, holidayPayload.holiday_date, holidayPayload.holiday_reason]
        )

        if (holiday.length) {
            const findHoliday = await this.calendar.query(
                `SELECT * FROM calendar WHERE sr_no=$1 OR holiday_date=$2 OR holiday_reason=$3`,
                [holidayPayload.sr_no, holidayPayload.holiday_date, holidayPayload.holiday_reason]
            )
            return {
                holiday: findHoliday
            }
        } else {
            return {
                message: "No Such Holiday"
            }
        }
    }


    // async findHoliday({ sr_no, holiday_date, holiday_reason }: { sr_no: number, holiday_date: string, holiday_reason: string } = { sr_no: 0, holiday_date: "", holiday_reason: "" }) {
    //     // check if holiday exists
    //     const result = await this.calendar.query(
    //         `SELECT * FROM calendar WHERE holiday_date='${holiday_date}'`
    //     )
    //     if (!result.length) {
    //         return { message: "No Such Holiday!" }
    //     } else {
    //         const holiday = await this.calendar.query(
    //             `SELECT * FROM calendar WHERE sr_no=$1 OR holiday_date = $2 OR holiday_reason = $3`,
    //             [sr_no, holiday_date, holiday_reason]
    //         )
    //         return {
    //             holiday: holiday
    //         }
    //     }
    // }
}
