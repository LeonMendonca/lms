import { z } from 'zod';

export const createNotesSchema = z.object({
  noteDescription: z.string(),
  noteResource: z.string(),
  noteTitle: z.string(),
  category: z.string(),
  author: z.array(z.string()),
  instituteName: z.string(),
  instituteUuid: z.string().uuid(),
});

export type TCreateNotesDTO = z.infer<typeof createNotesSchema>;
