import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { LibraryConfig } from "../entity/library_config.entity"

const updateLibraryRules = createObjectOmitProperties(new LibraryConfig(), ['createdAt'])

export const updateLibraryRuleSchema = z.object({
    // [updateLibraryRules.instituteUUID] : z.string(),
    institute_uuid : z.string().uuid(),
    [updateLibraryRules.libraryRuleId]: z.string(),
    [updateLibraryRules.createdByUUID]: z.string().uuid().optional(),
    // [updateLibraryRules.enableEmail]: z.boolean().optional(),
    [updateLibraryRules.isArchived]: z.boolean().optional(),
    [updateLibraryRules.lateFeesPerDay]: z.number().optional(),
    [updateLibraryRules.maxBooks]: z.number().optional(),
    [updateLibraryRules.maxDays]: z.number().optional(),
    [updateLibraryRules.operatingHours]: z.object({
        starting_time: z.string(),
        closing_time: z.string()
    }).optional(),
    [updateLibraryRules.emailNotifications]: z.object({
        borrow_books_admin: z.boolean().optional(),
        borrow_books_student: z.boolean().optional(),
        return_books_admin: z.boolean().optional(),
        return_books_student: z.boolean().optional(),
        checkin_admin: z.boolean().optional(),
        checkin_student: z.boolean().optional(),
        checkout_admin: z.boolean().optional(),
        checkout_student: z.boolean().optional(),
        penalties_admin: z.boolean().default(true).optional(),
        penalties_student: z.boolean().default(true).optional()
    }).optional()
})

export type TLibraryUpdateDTO = z.infer<typeof updateLibraryRuleSchema>