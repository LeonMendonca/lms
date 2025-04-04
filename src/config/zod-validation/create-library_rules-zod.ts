import { createObjectIncludeProperties, createObjectOmitProperties } from "src/misc/create-object-from-class"
import { z } from "zod"
import { LibraryConfig } from "../entity/library_config.entity"

const createLibraryRules = createObjectOmitProperties(new LibraryConfig(), ['libraryRuleId', 'createdAt', 'isArchived'])

export const createLibraryRuleSchema = z.object({
    [createLibraryRules.instituteId]: z.string(),
    [createLibraryRules.maxBooks]: z.number(),
    [createLibraryRules.maxDays]: z.number(),
    [createLibraryRules.lateFeesPerDay]: z.number(),
    [createLibraryRules.operatingHours]: z.object({
        starting_time: z.string(),
        closing_time: z.string()
    }),
    [createLibraryRules.enableEmail]: z.boolean(),
    [createLibraryRules.createdByUUID]: z.string().uuid().optional()
})

export type TLibraryDTO = z.infer<typeof createLibraryRuleSchema>