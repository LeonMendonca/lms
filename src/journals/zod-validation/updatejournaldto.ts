import { z } from "zod"

const CategoryEnum = z.enum(["journal", "magazine"])

export const updateJournalSchema = z.object({
    journal_uuid: z.string().optional(),
    journal_title: z.string().min(10).optional(),
    editor_name: z.string().min(10).optional(),
    place_of_publication: z.string().optional(),
    issn: z.string().min(8).optional(),
    category: CategoryEnum.optional(),
    subscription_id: z.string().optional(),
    frequency: z.string().optional(),
    issue_number: z.string().optional(),
    vendor_name: z.string().optional(),
    subscription_price: z.number().optional(),
    // subscription_price: z.string().transform((val) => Number(val)).optional(),
    library_name: z.string().optional(),
    // total_count: z.string().transform((val) => Number(val)).optional(),
    // available_count: z.string().transform((val) => Number(val)).optional(),
    title_images: z.array(z.string()).optional(),
    title_additional_fields: z.record(z.any()).optional(),
    title_description: z.string().optional()
})


export type TUpdateJournalTitleDTO = z.infer<typeof updateJournalSchema>