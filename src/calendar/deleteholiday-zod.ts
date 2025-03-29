import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { Calendar } from "./entity/calendar.entity"

const deleteHolidayObject = createObjectOmitProperties(new Calendar(), [])

export const deleteHolidaySchema = z.object({
    [deleteHolidayObject.SrNo]: z.number().optional(),
    [deleteHolidayObject.holidayDate]: z.string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" })
        .optional(),
    [deleteHolidayObject.holidayReason]: z.string().optional()
})

export type TDeleteHolidayDTO = z.infer<typeof deleteHolidaySchema>