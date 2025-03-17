import { z } from "zod"

export const trialCopySchema = z.object({
    uuid: z.string().uuid('Invalid UUID'),
    journal_name: z.string().min(1, 'Name is required'),
});

export type createTrialCopyDto = z.infer<typeof trialCopySchema>