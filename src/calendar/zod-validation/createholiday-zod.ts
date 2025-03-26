import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { Calendar } from "../entity/calendar.entity"

const createHolidayObject = createObjectOmitProperties(new Calendar(), ['SrNo'])

export const createHolidaySchema = z.object({
    [createHolidayObject.holidayDate]: z.string().date(),
    [createHolidayObject.holidayReason]: z.string().min(5)
})

export type TCreateHolidayDTO = z.infer<typeof createHolidaySchema>