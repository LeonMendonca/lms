import { z } from 'zod';

export const bookQuerySchema = z.object({
  book_id: z.string().uuid().optional(),
  book_title: z.string().min(1, { message: 'No title provided' }).optional(),
  book_author: z.string().min(1, { message: 'No author provided' }).optional(),
  bill_no: z
    .string()
    .min(1)
    .optional()
    .refine((z) => !isNaN(Number(z)), {
      message: 'Not a valid Bill number',
    }),
});

export type TbookQueryValidator = z.infer<typeof bookQuerySchema>;
