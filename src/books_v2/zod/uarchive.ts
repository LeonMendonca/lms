import { z } from 'zod';

//Book Title UUID
export const createObjectSchema = z.object({
  book_uuid: z.string().uuid()
});

export type TupdatearchiveZodDTO = z.infer<typeof createObjectSchema>;
