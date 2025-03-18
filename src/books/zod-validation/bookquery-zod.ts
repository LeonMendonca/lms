import { createObjectIncludeProperties } from 'src/misc/create-object-from-class';
import { z } from 'zod';
import { Books } from '../books.entity';

export const createBookQuery = createObjectIncludeProperties(new Books(), ['bookUUID', 'bookTitle', 'bookAuthor', 'isbn'])

export const bookQuerySchema = z.object({
  [createBookQuery.bookUUID]: z.string().uuid().optional(),
  [createBookQuery.bookTitle]: z.string().min(1, { message: 'No title provided' }).optional(),
  [createBookQuery.bookAuthor]: z.string().min(1, { message: 'No author provided' }).optional(),
  [createBookQuery.isbn]: z
    .string()
    .min(1, { message: 'No ISBN provided' })
    //ISBN format not known
    //.refine((z) => !isNaN(Number(z)), {
    //  message: 'Not a valid Bill number',
    //})
    .optional(),
});

export type TbookQueryValidator = z.infer<typeof bookQuerySchema>;
