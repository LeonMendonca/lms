import { z } from "zod";

export const updateFeesPenaltiesZod = z.object({
    student_id: z.string().min(9, { message: "Invalid ID or Empty" }),
    paid_amount: z.number().nonnegative(),
    payment_method: z.enum(['offline', 'online']),
    copy_id: z.string().min(8, { message: "Invalid ID or Empty" })
});

export type TUpdateFeesPenaltiesZod = z.infer<typeof updateFeesPenaltiesZod>;