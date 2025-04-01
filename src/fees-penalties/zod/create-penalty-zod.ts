import { z } from "zod"

export const createPenaltyZod = z.object({
    student_id: z.string(),
    paid_amount: z.number().nonnegative(),
    payment_method: z.enum(['offline', 'online']),
    journal_copy_id: z.string().min(8, { message: "Invalid ID or Empty" })
})

export type TCreatePenaltyZod = z.infer<typeof createPenaltyZod>;