import { z } from 'zod';

//Journal Title UUID
export const createJournalObjectSchema = z.object({
    journal_uuid: z.string().uuid()
});

export type TupdatearchiveZodDTO = z.infer<typeof createJournalObjectSchema>;