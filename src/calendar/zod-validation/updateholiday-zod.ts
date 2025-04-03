import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { Calendar } from "../entity/calendar.entity"

const updateHolidayObject = createObjectOmitProperties(new Calendar(), ['SrNo'])

export const updateHolidaySchema = z.object({
    [updateHolidayObject.holidayDate]: z.string().date().optional(),
    [updateHolidayObject.holidayReason]: z.string().optional()
})

export type TUpdateHolidayDTO = z.infer<typeof updateHolidaySchema>