import { z } from 'zod';

export const issueLogSchema = z.object({
    student_id: z.string().min(10),
    copy_id: z.string(),
    action: z.enum(['borrow', 'return', 'in_library'], { message: "Invalid action. Expected borrow | return | in_library" }),
    // category: z.enum(['book', 'periodical'], {message: "Invalid action. Expected book | periodical"})
})

export type TIssueLogDTO = z.infer<typeof issueLogSchema>;