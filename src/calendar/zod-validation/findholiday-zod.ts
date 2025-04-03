import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { Calendar } from "../entity/calendar.entity"

const findHolidayObject = createObjectOmitProperties(new Calendar(), [])

export const findHolidaySchema = z.object({
    [findHolidayObject.SrNo]: z.number().optional(),
    [findHolidayObject.holidayDate]: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" })
        .optional(),
    [findHolidayObject.holidayReason]: z.string().optional()
})

export type TFindHolidayDTO = z.infer<typeof findHolidaySchema>