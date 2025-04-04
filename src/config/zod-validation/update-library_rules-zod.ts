import { z } from "zod"
import { createObjectOmitProperties } from "src/misc/create-object-from-class"
import { LibraryConfig } from "../entity/library_config.entity"

const updateLibraryRules = createObjectOmitProperties(new LibraryConfig(), ['createdAt', 'instituteId'])

export const updateLibraryRuleSchema = z.object({
    [updateLibraryRules.libraryRuleId]: z.string(),
    [updateLibraryRules.createdByUUID]: z.string().uuid().optional(),
    [updateLibraryRules.enableEmail]: z.boolean().optional(),
    [updateLibraryRules.isArchived]: z.boolean().optional(),
    [updateLibraryRules.lateFeesPerDay]: z.number().optional(),
    [updateLibraryRules.maxBooks]: z.number().optional(),
    [updateLibraryRules.maxDays]: z.number().optional(),
    [updateLibraryRules.operatingHours]: z.object({
        starting_time: z.string(),
        closing_time: z.string()
    }).optional(),
})

export type TLibraryUpdateDTO = z.infer<typeof updateLibraryRuleSchema>