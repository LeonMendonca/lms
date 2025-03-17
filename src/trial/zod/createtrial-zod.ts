import { z } from "zod"

export const trialSchema = z.object({
    journal_name: z.string().min(1, 'Name is required'),
    total_count: z.number().min(1),
    available_count: z.number(),
})

export type createTrialDto = z.infer<typeof trialSchema>