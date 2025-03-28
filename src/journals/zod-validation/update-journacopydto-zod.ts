import { z } from "zod"

export const updatePeriodicalSchema = z.object({
    journal_copy_id: z.string().optional(),
    barcode: z.string().optional(),
    item_type: z.string().optional(),
    issn: z.string().optional(),
    journal_title: z.string().optional(),
    editor_name: z.string().optional(),
    created_by: z.string().optional(),
    remarks: z.string().optional(),
    copy_images: z.string().optional(),
    copy_additional_fields: z.string().optional(),
    copy_description: z.string().optional(),
})

export type TUpdatePeriodicalDTO = z.infer<typeof updatePeriodicalSchema>