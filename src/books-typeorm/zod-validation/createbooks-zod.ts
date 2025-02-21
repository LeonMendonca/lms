import { z } from 'zod';

export const createBookSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .required();

export type CreateBookDTO = z.infer<typeof createBookSchema>;
