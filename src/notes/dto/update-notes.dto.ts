import { z } from 'zod';

export const updateNotesSchema = z.object({
  noteDescription: z.string().optional(),
  noteResource: z.string().optional(),
  noteTitle: z.string().optional(),
  category: z.string().optional(),
  author: z.array(z.string()).optional(),
});

export type TUpdateNotesDTO = z.infer<typeof updateNotesSchema>;
