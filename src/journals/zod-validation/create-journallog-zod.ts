import { z } from 'zod';

export const journalLogsSchema = z.object({
    student_id: z.string().min(10),
    copy_id: z.string(),
    action: z.enum(['borrow', 'return', 'in_library'], { message: "Invalid action. Expected borrow | return | in_library" }),
});

export type TCreateJournalLogDTO = z.infer<typeof journalLogsSchema>;