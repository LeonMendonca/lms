import { createObjectIncludeProperties, createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { LibraryConfig } from "../entity/library_config.entity"

const createLibraryRules = createObjectOmitProperties(new LibraryConfig(), ['libraryRuleId', 'createdAt', 'isArchived'])

export const createLibraryRuleSchema = z.object({
    institute_id: z.string(),
    [createLibraryRules.maxBooks]: z.number(),
    [createLibraryRules.maxDays]: z.number(),
    [createLibraryRules.lateFeesPerDay]: z.number(),
    [createLibraryRules.operatingHours]: z.object({
        starting_time: z.string(),
        closing_time: z.string()
    }),
    // [createLibraryRules.enableEmail]: z.boolean(),
    [createLibraryRules.createdByUUID]: z.string().uuid().optional(),
    [createLibraryRules.emailNotifications]: z.object({
        borrow_books_admin: z.boolean(),
        borrow_books_student: z.boolean(),
        return_books_admin: z.boolean(),
        return_books_student: z.boolean(),
        checkin_admin: z.boolean(),
        checkin_student: z.boolean(),
        checkout_admin: z.boolean(),
        checkout_student: z.boolean(),
        penalties_admin: z.boolean().default(true),
        penalties_student: z.boolean().default(true)
    })
})

export type TLibraryDTO = z.infer<typeof createLibraryRuleSchema>